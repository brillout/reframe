<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage-manual.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage-manual.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage-manual.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage-manual.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage-manual.template.md` instead.






-->
<div><p align="right"><sup>
    <img src="https://github.com/brillout/reframe/raw/master/docs/images/online-icon.svg?sanitize=true" width="13" height="20"> Chat with Reframe author on <a href="https://discord.gg/kqXf65G">discord.gg/kqXf65G</a>
</sup></p></div>

[<p align="center"><img src="https://github.com/brillout/reframe/raw/master/docs/images/logo-with-title.svg?sanitize=true" width=450 height=94 style="max-width:100%;" alt="Reframe"/></p>](https://github.com/brillout/reframe)

<div><p align="center">
        Framework to create web apps with React.
</p></div>

<div><p align="center">
    <b>Easy</b>
    -
    Create apps with page configs.
    &nbsp;&nbsp;&nbsp;
    <b>Universal</b>
    -
    Create all kinds of apps.
    &nbsp;&nbsp;&nbsp;
    <b>Escapable</b>
    -
    Easy & progressive escape.
</p></div>

<br/>

[Overview](/../../)<br/>
[Reframe Rational](/docs/reframe-rational.md)<br/>
[Usage Manual](/docs/usage-manual.md)<br/>
[Customization Manual](/docs/customization-manual.md)<br/>
[Plugins](/docs/plugins.md)

<br/>

# Usage Manual

The usage manual acts as reference for using Reframe wihtout advanced customization.
This manual covers most common use cases.

#### Contents

###### Basic Usage

 - [Getting Started](#getting-started)
 - [HTML-static VS HTML-dynamic](#html-static-vs-html-dynamic)
 - [DOM-static VS DOM-dynamic](#dom-static-vs-dom-dynamic)
 - [CSS & Static Assets](#css--static-assets)
 - [Async Data](#async-data)
 - [Links & Page Navigation](#links--page-navigation)
 - [Production Environment](#production-environment)

###### Further Usage

 - [Custom Server](#custom-server)
 - [Custom Head](#custom-head)
 - [404 Page](#404-page)
 - [Advanced Routing](#advanced-routing)
 - [Partial DOM-dynamic](#partial-dom-dynamic)
 - [Custom Browser JavaScript](#custom-browser-javascript)
 - [Related External Docs](#related-external-docs)



## Getting Started

Let's start by writing a Hello World page.

We first create a `pages/` directory

~~~shell
mkdir -p ~/tmp/reframe-playground/pages
~~~

we then create a new file `~/tmp/reframe-playground/pages/HelloPage.html.js` with following content

~~~js
import React from 'react';

const HelloWorldPage = {
    route: '/',
    view: () => (
        <div>
            Hello World, from Reframe.
        </div>
    ),
};
export default HelloWorldPage;
~~~

We call `HelloWorldPage` a *page config*.
Every page is defined by such page config.

Note that it is important to save the page config with a filename that ends with `.html.js`.
We will discuss later why.

Let's now run our Hello World page.
For that, we will use the reframe CLI and we will need React.
Let's install these two.

~~~shell
npm install -g @reframe/cli
~~~
~~~shell
cd ~/tmp/reframe-playground/ && npm install react
~~~

We run the CLI

~~~shell
reframe ~/tmp/reframe-playground/pages
~~~

which prints

~~~shell
$ reframe ~/tmp/reframe-playground/pages
✔ Frontend built at ~/tmp/reframe-playground/dist/browser/ [DEV]
✔ Server running at http://localhost:3000
~~~

and spins up a server making our page available at http://localhost:3000.

The HTML `view-source:http://localhost:3000/` is

~~~html
<!DOCTYPE html>
<html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <meta charset="utf-8">
    </head>
    <body>
        <div id="react-root"><div>Hello World, from Reframe.</div></div>
    </body>
</html>
~~~

As we can see, the page doesn't load any JavaScript.
The DOM is static, as there isn't any JavaScript to manipulate the DOM.
We say that the page is *DOM-static*.

We can also create pages with interactive views and a dynamic DOM.
We will see later how.

Our page is what we call "HTML-dynamic", and we now discuss what this means.



## HTML-static vs HTML-dynamic

Let's consider the Hello World page of our previous section.
When is its HTML generated?
To get an answer we modify the page to display a timestamp.
We alter the page config from our previous section at `~/tmp/reframe-playground/pages/HelloPage.html.js` to

~~~js
import React from 'react';

export default {
    route: '/',
    view: () => (
        <div>
            Hello World, from Reframe.
            <br/>
            (Generated at {new Date().toLocaleTimeString()})
        </div>
    ),
};
~~~

If you haven't already, let's start a server

~~~shell
npm install -g @reframe/cli
reframe ~/tmp/reframe-playground/pages
~~~

and the shell prints

~~~shell
$ reframe ~/tmp/reframe-playground/pages
✔ Frontend built at ~/tmp/reframe-playground/dist/browser/ [DEV]
✔ Server running at http://localhost:3000
~~~

If you haven't closed the server from the previous section, then
Reframe automatically re-compiled the frontend and printed a `✔ Re-build` notification to your shell.

~~~shell
$ reframe ~/tmp/reframe-playground/pages
✔ Frontend built at ~/tmp/reframe-playground/dist/browser/ [DEV]
✔ Server running at http://localhost:3000
✔ Re-build
~~~

We now reload the page and &mdash; assuming the time is 13:37:00 &mdash; the HTML `view-source:http://localhost:3000/hello` is

~~~html
<!DOCTYPE html>
<html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <meta charset="utf-8">
    </head>
    <body>
        <div id="react-root"><div>Hello from Reframe.<br/>(Generated at 13:37:00)</div></div>
    </body>
</html>
~~~

If we reload one second later &mdash; at 13:37:01 &mdash; we get the same HTML except that
`(Generated at 13:37:00)` is now replaced with `(Generated at 13:37:01)`.
This means that the HTML is (re-)rendered every time we load the page.
We say that the HTML is generated at *request-time* and that the page is *HTML-dynamic*.

Now, the HTML of our Hello World page doesn't really need to be dynamic.
Let's make it static.

For that we change our page config `~/tmp/reframe-playground/pages/HelloPage.html.js` to

~~~js
import React from 'react';

export default {
    route: '/',
    view: () => (
        <div>
            Hello World, from Reframe.
            <br/>
            (Generated at {new Date().toLocaleTimeString()})
        </div>
    ),
    htmlIsStatic: true,
};
~~~

When we declare the page to be HTML-static
(with `htmlIsStatic: true`),
Reframe renders the HTML only once, namely when building the frontend.

If the time when building the frontend was 12:00:00,
then our page will always show `(Generated at 12:00:00)`, no matter when we load the page.

We say that the HTML is generated at *build-time* and that the page is *HTML-static*.

We can actually see the HTML generated at build-time at `~/tmp/reframe-playground/dist/browser/index.html`.

To sum up,
`htmlIsStatic: false` declares the page as HTML-dynamic: The HTML is rendered at request-time.
And
`htmlIsStatic: true` declares the page as HTML-static: The HTML is rendered at build-time.

For pages with lot's of elements, generating the HTML at build-time instead of request-time can be a considerable performance gain.

Also,
if we declare all our pages as HTML-static,
then all HTMLs are rendered at build-time,
no server code is required,
our app is static,
and we can deploy our app to a static website host
such as [GitHub Pages](https://pages.github.com/) or Netlify.

Not only do we have control over whether the HTML is static or not,
but we also have control over whether the DOM is static or not.
Before we move on to the DOM, let's look at a special case of an HTML-dynamic page.

~~~js
// /examples/pages/HelloPage.html.js

import React from 'react';

const HelloComponent = (
  props => {
    // Our route argument `name` is available at `props.route.args.name`
    const name = props.route.args.name;
    return (
      <div>Hello {name}</div>
    );
  }
);

const HelloPage = {
  // Reframe follows the same route string syntax than React Router.
  // React Router's components `<Route>`, `<Switch>`, etc. can be used
  // by adding the plugin `@reframe/react-router`.
  route: '/hello/:name',

  // Page's React component
  view: HelloComponent,

  // Page's <title>
  title: 'Hi there',
};

export default HelloPage;
~~~

Not only is this page HTML-dynamic but it actually has to.
That is because its route, `/hello/{name}`, is parameterized.
There are an infinite number of pages with URLs matching the route, such as `/hello/Alice-1`, `/hello/Alice-2`, `/hello/Alice-3`, etc.
We can't compute an infinite number of pages at build-time; the page has to be HTML-dyanmic.

All pages with a parameterized route are HTML-dynamic.

In general, as HTML-static pages are more performant, we recommand to make a page HTML-dynamic only if necessary.

Let's now create pages with interactive views.



## DOM-static VS DOM-dynamic

Let's consider the following page config that defines a page displaying the current time.

~~~js
// /examples/pages/TimePage.universal.js

import {TimeComponent} from '../views/TimeComponent';

export default {
    title: 'Current Time',
    route: '/time',
    view: TimeComponent,
};
~~~

~~~js
// /examples/views/TimeComponent.js

import React from 'react';

class TimeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {now: new Date()};
    }
    componentDidMount() {
        setInterval(
            () => this.setState({now: new Date()}),
            1000
        );
    }
    render() {
        return <span>{toTimeString(this.state.now)}</span>;
    }
}

const toTimeString = now => (
    [
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
    ]
    .map(d => d<=9 ? '0'+d : d)
    .join(':')
);

export {TimeComponent, toTimeString};
~~~

Looking at the HTML `view-source:http://localhost:3000/time`:

~~~html
<!DOCTYPE html>
<html>
    <head>
        <title>Current Time</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <meta charset="utf-8">
    </head>
    <body>
        <div id="react-root"><div>Time: 13:38:00</div></div>
        <script type="text/javascript" src="/commons.hash_cef317062944dce98c01.js"></script>
        <script type="text/javascript" src="/TimePage.entry.hash_972c7f760528baca032a.js"></script>
    </body>
</html>
~~~

we see that, in contrast to our previous DOM-static pages, the page loads JavaScript code.

The JavaScript code
mounts a `<TimeComponent />` to the DOM element `#react-root`, and
the mounted `<TimeComponent />` then updates the DOM every second to always show the current time.

The DOM changes over time and we say that the page is *DOM-dynamic*.

But why does Reframe hydrate the DOM whereas it previously didn't at our previous examples?
It's because our page config is saved as `TimePage.universal.js`,
a filename name ending with `.universal.js`,
whereas our previous examples were saved as `*.html.js` files.

So,
a page with a page config saved as `pages/*.html.js` is treated as DOM-static and
a page with a page config saved as `pages/*.universal.js` is treated as DOM-dynamic.
Reframe also picks up `pages/*.entry.js` and `pages/*.dom.js` files and we will talk about these in the sections "Partial DOM-dynamic" and "Custom Browser JavaScript".

In case you are curious, the loaded JavaScript are:
 - `/commons.hash_xxxxxxxxxxxxxxxxxxxx.js`
   which
   is around 250KB in production,
   inlcudes React (~100KB),
   polyfills (~100KB),
   the router, and the `@reframe/browser` package.
   It is loaded by all pages and is indefinitely cached across all pages.
 - `/TimePage.entry.hash_xxxxxxxxxxxxxxxxxxxx.js`
   which
   includes the transpiled version of `TimePage.universal.js` and a tiny wrapper.
   It is specific to the page and is usually lightweight.

As DOM-static pages are more performant, we recommand to make pages DOM-dynamic only if necessary.

So, when defining the page with a `.universal.js` file, the entire page is hydrated.



## CSS & Static Assets

A CSS file can be loaded and applied by importing it.

~~~js
import './GlitterStyle.css';
~~~

Static assets (images, fonts, videos, etc.) can be imported as well
but importing an asset doesn't actually load it:
Only the URL of the asset is returned.
It is up to us to use/fetch the URL of the asset.

~~~js
import diamondUrl from './diamond.png';

// do something with diamondUrl, e.g. `await fetch(diamondUrl)` or `<img src={diamondUrl}/>`
~~~

In addition, static assets can be referenced in CSS files by using the CSS `url` data type.

~~~css
.diamond-background {
    background-image: url('./diamond.png');
}
~~~

The following shows code using CSS and static assets as described above.

~~~js
// /examples/pages/GlitterPage.universal.js

const {GlitterComponent} = require('../views/GlitterComponent');

const GlitterPage = {
    route: '/glitter',
    title: 'Glamorous Page',
    view: GlitterComponent,
};

module.exports = GlitterPage;
~~~

~~~js
// /examples/views/GlitterComponent.js

import React from 'react';
import './GlitterStyle.css';
import diamondUrl from './diamond.png';

const Center = ({children, style}) => (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', ...style
      }}
    >
        {children}
    </div>
);

const Diamond = () => <div className="diamond diamond-background"/>;

const GlitterComponent = () => (
    <Center style={{fontSize: '2em'}}>
        <Diamond/>
        Shine
        <img className='diamond' src={diamondUrl}/>
    </Center>
);

export {GlitterComponent};
~~~

~~~css
// /examples/views/GlitterStyle.css

body {
    background-color: pink;
    font-family: 'Tangerine';
    font-size: 2em;
}
.diamond-background {
    background-image: url('./diamond.png');
    background-repeat: no-repeat;
    background-size: contain;
}

.diamond {
    width: 80px;
    height: 47px;
    margin: 25px;
    display: inline-block;
}

@font-face {
    font-family: 'Tangerine';
    src: url('./Tangerine.ttf') format('truetype');
}
~~~

Note that CSS and static assets are handled by webpack,
and that the webpack config is fully customizable.
We referer to the Customization Manual for further information.

Also note that all types of static assets are supported.



## Async Data

A common React use case is to display data that is fetched over the network.
The page config supports a `async getInitialProps()` property that Reframe calls every time and before the view is rendered.
(On both the server and in the browser.)
We can therefore use `async getInitialProps()` to fetch the data that page's React components require.

For example:

~~~js
// /examples/pages/GameOfThronesPage.html.js

import React from 'react';
import {CharacterNames, getCharacters} from '../views/GameOfThrones';

export default {
    route: '/game-of-thrones',
    title: 'Game of Thrones Characters',
    description: 'List of GoT Characters',
    view: props => (
        <CharacterNames
          names={props.characters.map(character => character.name)}
        />
    ),
    // Everything returned in `getInitialProps()` is be passed to the props of the view
    getInitialProps: async () => {
        const characters = await getCharacters();
        return {characters};
    },
};
~~~

~~~js
// /examples/views/GameOfThrones.js

import React from 'react';
import fetch from '@brillout/fetch';

const CharacterNames = props => (
    <div>
        <h3>Game of Thrones Characters</h3>
        <table border="7" cellPadding="5">
            <tbody>{
                props.names.map(name => (
                    <tr key={name}><td>
                        {name}
                    </td></tr>
                ))
            }</tbody>
        </table>
    </div>
);

async function getCharacters() {
    const urlBase = 'https://brillout-misc.github.io/game-of-thrones';
    const url = urlBase + '/characters/list.json';
    const characters = await (
        fetch(url)
        .then(response => response.json())
        .catch(err => {console.error(url); throw err})
    );
    return characters;
}

export {CharacterNames};
export {getCharacters};
~~~

Because `aysnc getInitialProps()` is called and waited for prior to rendering the HTML, our page's HTML `view-source:http://localhost:3000/game-of-thrones` displays the data already.

~~~html
<!DOCTYPE html>
<html>
    <head>
        <title>Game of Thrones Characters</title>
        <meta name="description" content="List of GoT Characters">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <meta charset="utf-8">
    </head>
    <body>
        <div id="react-root"><div><h3>Game of Thrones Characters</h3><table border="7" cellPadding="5"><tbody><tr><td>Daenerys Targaryen</td></tr><tr><td>Jon Snow</td></tr><tr><td>Cersei Lannister</td></tr><tr><td>Petyr Baelish</td></tr><tr><td>Bran Stark</td></tr><tr><td>Tyrion Lannister</td></tr><tr><td>Varys</td></tr><tr><td>Tormund</td></tr><tr><td>Samwell Tarly</td></tr></tbody></table></div></div>
    </body>
</html>
~~~

Alternatively, we can fetch data in a statefull component.

~~~js
// /examples/pages/GameOfThrones2Page.universal.js

import React from 'react';
import {CharacterNames, getCharacters} from '../views/GameOfThrones';

class Characters extends React.Component {
    render() {
        if( ! this.state || ! this.state.names ) {
            return <div>Loading...</div>;
        }
        return <CharacterNames names={this.state.names}/>;
    }
    async componentDidMount() {
        const names = (
            (await getCharacters())
            .map(character => character.name)
        );
        this.setState({names});
    }
}

export default {
    route: '/game-of-thrones-2',
    view: Characters,
};
~~~

Note that,
when using such statefull component,
the server renders the HTML before the data is loaded.
In our case,
 this means that the HTML `view-source:http://localhost:3000/game-of-thrones-2`
displays the loading state `<div id="react-root"><div>Loading...</div></div>`.
And the HTML returned by the server is:

~~~html
<!DOCTYPE html>
<html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <meta charset="utf-8">
    </head>
    <body>
        <div id="react-root"><div>Loading...</div></div>
        <script src="/commons.hash_451146e5dbcfe0b09f80.js" type="text/javascript"></script>
        <script src="/GameOfThrones2Page.entry.hash_2c79748d10c1e953f159.js" type="text/javascript"></script>
    </body>
</html>
~~~



## Links & Page Navigation

Pages are linked by using link tags such as `<a href="/about">About</a>`.

For example:

~~~js
// /examples/pages/page-a.html.js

import React from 'react';

const pageA = {
    route: '/page-a',
    view: () => (
        <div>
            This is page A.
            <br/>
            Link to page B: <a href='/page-b'>/page-b</a>
        </div>
    ),
};

export default pageA;
~~~
~~~js
// /examples/pages/page-b.html.js

import React from 'react';

const pageB = {
    route: '/page-b',
    view: () => (
        <div>
            This is page B.
            <br/>
            Link to page A: <a href='/page-a'>/page-a</a>
        </div>
    ),
};

export default pageB;
~~~

There are two types of page navigation:
 - *HTML-navigation*
   <br/>
   When clicking a link, the new page's HTML is loaded.
   (In other words, the browser discards the current DOM and builds a new DOM upon the new page's HTML.)
 - *pushState-navigation*
   <br/>
   When clicking a link, the URL is changed by `history.pushState()` and the DOM is manipulated (instead of loading the new page's HTML).

Reframe does HTML-navigation for pages defined with page configs
and you can use React Router's components to have pushState-navigation.



## Production Environment

By default, Reframe compiles for development.

We can tell Reframe to compile for production by
 - setting `process.env.NODE_ENV = 'production';` in Node.js, or by
 - setting `export NODE_ENV='production'` in a Unix(-like) OS, or by
 - running `reframe --prod` in the shell

When compiling for production,
the auto-reload feature is disabled,
the code is transpiled to support all browsers (only the last 2 versions of Chrome and Firefox are targeted when compiling for dev),
the code is minifed,
the low-KB production version of React is used,
etc.

The Reframe CLI displays a `[PROD]` notification when compiling for production:

~~~shell
$ export NODE_ENV='production'
$ reframe
✔ Page directory found at ~/tmp/reframe/example/pages/
✔ Frontend built at ~/tmp/reframe/example/dist/browser/ [PROD]
✔ Server running at http://localhost:3000
~~~



## Custom Server

Instead of using the CLI, Reframe can be used as hapi plugin(s), as shown in the next example.

~~~js
// /examples/custom/server/hapi-server.js

const Hapi = require('hapi');
const {getHapiPlugins} = require('@reframe/server/getHapiPlugins');
const path = require('path');

(async () => {
    const server = Hapi.Server({port: 3000});

    const {HapiPluginReframe} = (
        await getHapiPlugins({
            pagesDirPath: path.resolve(__dirname, '../../pages'),
        })
    );

    await server.register([
        {plugin: HapiPluginReframe},
    ]);

    server.route({
        method: 'GET',
        path:'/custom-route',
        handler: function (request, h) {
            return 'This is a custom route. This could for example be an API endpoint.'
        }
    });

    await server.start();
    console.log(`Server running at ${server.info.uri}`);
})();
~~~

That way, we can create the hapi server ourselves, add routes to it, and configure it as we wish.

Reframe's server is fully customaziable, and
can be used with another server framework such as Express.
The Customization Manual elaborates on such possibilities.



## Custom Head

Reframe handles the outer part of HTML (including `<head>`, `<!DOCTYPE html`>, `<script>`, etc.) with `@brillout/html-crust`.

All options of `@brillout/html-crust` are available over the page config.
Thus, the page config has full control over the outer part of HTML including the `<head>`.

We refer to [`@brillout/html-crust`'s documentation](https://github.com/brillout/html-crust) for further information.

For example, the page config

~~~js
// /examples/pages/custom-html.html.js

import React from 'react';

export default {
    route: '/custom-html',
    headHtml: '<title>Full custom head</title>',
    bodyHtml: '<div>Full custom body</div>',
};
~~~

creates a page with following HTML

~~~js
<!DOCTYPE html>
<html>
  <head>
    <title>Full custom head</title>
  </head>
  <body>
    <div>Full custom body</div>
  </body>
</html>
~~~



## 404 Page

A 404 page can be implement by using a catch-all route:

~~~js
import React from 'react';

export default {
    route: '/:params*',
    title: 'Not Found',
    view: props => (
        <div>
            The page {props.route.url.pathname} does not seem to exist.
        </div>
    ),
};
~~~



## Advanced Routing

###### Reframe's default router

By default, Reframe uses [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) to match URLs with a route.
(React Router uses `path-to-regexp` as well.)

For example, in the following page config, Reframe will use `path-to-regexp` to determine if a URL matches the page's route `'/hello/:name'`.

~~~jsx
const HelloPage = {
    route: '/hello/:name',
    view: ({route: {args: {name}}}) => <div>Welcome {name}</div>,
};
~~~

We refer to [`path-to-regexp`'s docs](https://github.com/pillarjs/path-to-regexp) for further information about the route string syntax.

###### React Router

You can use React Router's components by adding the plugin [`@reframe/react-router`](/react-router).

The React Router components allow you to have

 - **pushState-navigation**
   <br/>
   What "pushState-navigation" means is explained in [Links & Page Navigation](#links--page-navigation).
 - **Nested Routes**
   <br/>
   For pages that differ in only some parts, in other words, where the majority of the view is the same.
 - **SPAs**
   <br/>
   Apps where the app's entire browser-side code is bundled in one script and loaded at once.
 - **URL hash**
   <br/>
   URLs with a `window.location.hash`.

###### Custom router

Reframe can be used with any routing library.

It can, for example, be used with [Crossroads.js](https://github.com/millermedeiros/crossroads.js).

We refer to the source code of the plugin [`@reframe/crossroads`](/crossroads) for further information about how to use Reframe with another routing library.


## Partial DOM-dynamic

When defining the page with a `.universal.js` file, the entire page is hydrated.
But this is not always what we want.
Imagine a page where a vast majority of the page is DOM-static and
only some parts of the page need to be made DOM-dynamic.
It that case,
it would be wasteful to load the view's entire code in the browser and
to hydrate the whole page.
Instead, we can tell Reframe to hydrate parts of the page only.
We call this technique *partial DOM-dynamic*.

Besides being able to hydrate the entire page with a `.universal.js` page config,
we can tell Reframe to hydrate only some parts of the page.
This means that, while these parts are DOM-dynamic, the rest of the page stays DOM-static.

This can be a significant performance improvement
when large portions of the page don't need to be DOM-dynamic.

It also introduces a separation between the DOM-static part and the DOM-dynamic part of the page,
which makes reasoning about the page easier.

To achieve such partial hydration,
instead of defining the page with one page config `MyDynamicPage.universal.js`,
we define the page with two page configs.
One page config `MyDynamicPage.html.js` for server-side rendering and
another `MyDynamicPage.dom.js` for browser-side rendering.
Like in the following.

~~~js
// /examples/pages/NewsPage.html.js

import React from 'react';

import {TimeComponent} from '../views/TimeComponent';
import {LatestNewsComponent} from '../views/LatestNewsComponent';

const NewsComponent = () => (
    <div>
        <LatestNewsComponent />
        <br/>
        <small style={{color: 'blue'}}>
            Time: <span id="time-root"><TimeComponent /></span>
        </small>
    </div>
);

export default {
    title: 'News Site',
    route: '/news',
    view: NewsComponent,
    // `LatestNewsComponent` needs to be refreshed on every page load.
    // We therefore declare the page as HTML-dynamic.
    htmlIsStatic: false,
};
~~~

~~~js
// /examples/pages/NewsPage.dom.js

import React from 'react';

import {TimeComponent} from '../views/TimeComponent';

export default {
    view: [
        {
            containerId: 'time-root',
            view: TimeComponent,
        }
    ],
};
~~~

When we define a page with two separate page configs like this,
not only do we hydrate only what's necessary, but we also load only the code that is necessary.
Because only the `.dom.js` page config is loaded in the browser, and
the `.html.js` page config is never loaded in the browser.
For example, we can see that the `NewsPage.dom.js` file only loads `TimeComponent` and not the (imaginary) KB heavy `LatestNewsComponent`.

Note that we can set `view` to an array with more than one view object, and that way we can hydrate several parts of the page.

Beyond being able to define partial hydration,
we can gain further control over what's happening in the browser
by writing the browser entry code ourselves.
(Instead of using the default browser entry code generated by Reframe.)



## Custom Browser JavaScript

If our page is saved as `pages/MyPage.html.js` and, if we save some JavaScript code saved as `pages/MyPage.entry.js`, then Reframe will take `pages/MyPage.entry.js` as browser entry point.
See the Customization Manual for further information.

We can as well add arbitrary script tags to the page's HTML (external scripts, async scripts, etc.).
See the "Custom Head" section.



## Related External Docs

The following packages are used by Reframe.
 - [Repage](https://github.com/brillout/repage) - Low-level and unopinionted page management library.
 - [@brillout/html-crust](https://github.com/brillout/html-crust) - HTML outer part handler. (`<head>`, `<!DOCTYPE html>`, `<script>`, etc.)
 - [@brillout/find](https://github.com/brillout/find) - Package to find files. The Reframe CLI uses it to find the `pages/` directory.
 - [Rebuild](https://github.com/brillout/rebuild) - High-level asset bundling tool build on top of the low-level tool webpack.


<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage-manual.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage-manual.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage-manual.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage-manual.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage-manual.template.md` instead.






-->
