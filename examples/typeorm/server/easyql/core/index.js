module.exports = {install};

function install({UniversalDatabaseInterface, permissions, SECRET_KEY}) {
  const assert_internal = require('reassert/internal');
  const assert_usage = require('reassert/usage');
  const assert_warning = require('reassert/warning');

  const cookie = require('cookie');
  const cookieSignature = require('cookie-signature');
  const parseUri = require('@brillout/parse-uri');
  const readAuthCookie = require('./readAuthCookie');

  return {
      loggedUserParamHandler,
      apiQueryParamHandler,
      authReqsHandler,
      apiReqHandler,
  };

  function apiQueryParamHandler({req}) {
      const URL_BASE = process.env['EASYQL_URL_BASE'] || '/api/';

      if( ! req.url.startsWith(URL_BASE) ) {
          return {apiQuery: null};
      }

      const queryString = req.url.slice(URL_BASE.length);
      assert_internal(queryString);
      const apiQuery = JSON.parse(decodeURIComponent(queryString));

      return {apiQuery};
  }

  async function apiReqHandler(args) {
    const {apiQuery} = args;
    assert_internal(apiQuery===null || apiQuery);
    if( apiQuery===null ) {
      return null;
    }

    const result = await getApiRequestResult(args);
    assert_internal(result===null || result);

    if( result ) {
      assert_internal(result.constructor===Object);
      return {
        body: JSON.stringify(result),
      };
    }

    return null;
  }

  async function getApiRequestResult(args) {
      assert_usage(permissions);

      /*
      const args__prettier = Object.assign({}, args);
      delete args__prettier.req;
      */

      const {req, apiQuery} = args;
      assert_internal(req && apiQuery, args);
      assert_usage(apiQuery.modelName, apiQuery);

      const matchingPermissions = permissions.filter(({modelName}) => modelName===apiQuery.modelName);
      assert_warning(
          matchingPermissions.length>0,
          "No permission spec found for `"+apiQuery.modelName+"`",
      );
      assert_usage(matchingPermissions.length<=1, matchingPermissions);
      const permission = matchingPermissions[0];

      const {queryType} = apiQuery;
      assert_usage(['write', 'read'].includes(queryType), apiQuery);

      if( queryType==='read' ) {
          const queryResult = await UniversalDatabaseInterface.runQuery(apiQuery);
          const {objects} = queryResult;
          if( await hasPermission(objects, permission.read, args) ) {
              return queryResult;
          }
          return permissionDenied();
      }

      if( queryType==='write' ) {
          const objectProps = apiQuery.object;
          assert_usage(objectProps, apiQuery);
          if( await hasPermission([objectProps], permission.write, args) ) {
              const queryResult = await UniversalDatabaseInterface.runQuery(apiQuery);
              return queryResult;
          }
          return permissionDenied();
      }

      assert_internal(false);
      return;

      function permissionDenied() {
          assert_warning("permission denied");
          return null;
      }
  }

  async function hasPermission(objects, permissionRequirement, args) {
      if( permissionRequirement === true ) {
          return true;
      }
      if( permissionRequirement instanceof Function ) {
          const permitted = (
              objects.every(object => {
                  return permissionRequirement({object, ...args});
              })
          );
          return permitted;
      }
      assert_usage(false, permissionRequirement);
  }





  function loggedUserParamHandler({req}) {
      const cookieString = req.headers.cookie;

      const parsedInfo = readAuthCookie({cookieString});

      if( ! parsedInfo ) {
          return null;
      }

      let {loggedUser, authCookie} = parsedInfo;

   // console.log(loggedUser, cookieString);

      const validation = cookieSignature.unsign(authCookie, SECRET_KEY);
      assert_internal(validation===false || validation===authCookie.split('.').slice(0, -1).join('.'));
      if( ! validation ) {
          return null;
      }

      assert_internal(loggedUser.constructor===Object);
      return {loggedUser};
  }

  async function authReqsHandler({req, payload}) {
      const url = parseUri(req.url);

      const authResponse = await authStrategy({url, req, payload});
      assert_usage(authResponse===null || Object.keys(authResponse).length>0, authResponse);
      if( authResponse===null ) {
          return null;
      }
      const {loggedUser, redirect, authError} = authResponse;

      if( authError ) {
        assert_internal(authError.constructor===String);
        return {body: authError};
      }

      assert_internal(loggedUser && loggedUser.id, authResponse);
      assert_internal(redirect, authResponse);

      const timestamp = new Date().getTime();

      const authVal = cookieSignature.sign(loggedUser.id+'.'+timestamp, SECRET_KEY);

      const cookieVal = cookie.serialize('auth', authVal, {
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
          // TODO-LATER make `httpOnly` true
       // httpOnly: true,
          sameSite: 'strict',
       // secure: true,
      });

      const headers = [
          {
              name: 'Set-Cookie',
              value: cookieVal,
          },
      ];

      const body = JSON.stringify(loggedUser);

      return {body, headers, redirect};
  }

  async function authStrategy({url, req, payload}) {
      const isSignin = url.pathname==='/auth/signin';
      const isSignup = url.pathname==='/auth/signup';

      if( ! isSignin && ! isSignup ) {
          return null;
      }

      payload = payload || await getBodyPayload(req, url);
      const userProps = payload;
      assert_internal('username' in userProps && 'password' in userProps && Object.keys(userProps).length===2, userProps);

      if( isSignin ) {
          const {objects} = await UniversalDatabaseInterface.runQuery({
            queryType: 'read',
            modelName: 'User',
            filter: userProps,
          });
          assert_internal(objects.length<=1, objects, userProps);
          const [user] = objects;

          if( user ) {
              return {loggedUser: user, redirect: '/'};
          } else {
              return {authError: 'Wrong login information'};
          }
      }

      if( isSignup ) {
          const {objects} = await UniversalDatabaseInterface.runQuery({
            queryType: 'write',
            modelName: 'User',
            object: userProps,
          });
          assert_internal(objects.length<=1);
          const [newUser] = objects;
          if( ! newUser ) {
            return {authError: "Couldn't save new user"};
          }
          return {loggedUser: newUser, redirect: '/'};
      }
  }
  }
