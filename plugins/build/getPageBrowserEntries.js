const assert_internal = require('reassert/internal');
const assert_usage = require('reassert/usage');
const pathModule = require('path');

const assert_pageConfig = require('@reframe/utils/assert_pageConfig');

const config = require('@brillout/reconfig').getConfig({configFileName: 'reframe.config.js'});


module.exports = getPageBrowserEntries;


function getPageBrowserEntries(pageModules) {
    return (
        pageModules
        .map(({pageExport: pageConfig, pageName, pageFile}) => {
            assert_pageConfig(pageConfig, pageFile);

            const browserEntryString = getBrowserEntryString({pageConfig, pageName, pageFile});

            return {
                pageName,
                browserEntryString,
                browserEntryOnlyCss: pageConfig.domStatic,
            };
        })
    );
}

function getBrowserEntryString({pageConfig, pageFile, pageName}) {
    const browserEntrySpec = getBrowserEntrySpec({pageConfig, pageFile, pageName});

    let browserEntryString = '';

    if( ! browserEntrySpec.doNotInlcudeBrowserConfig ) {
        const configCode = generateConfigCode();
        browserEntryString += configCode+'\n\n';
    }

    if( ! browserEntrySpec.doNotIncludePageConfig ) {
        const pageConfigCode = generatePageConfigCode(pageFile);
        browserEntryString += pageConfigCode+'\n\n';
    }

    browserEntryString += [
        "require('"+browserEntrySpec.browserEntryPath+"');",
        "",
    ].join('\n');

    return browserEntryString;
}

function generateConfigCode() {
    const lines = [
        "(() => {",
        "  const browserConfig = require('"+require.resolve('@reframe/browser/browserConfig')+"');",
    ];

    config
    .browserConfigs
    .forEach(({configName, configFile, configFiles}) => {
        assert_internal(!configFiles === !!configFile);
        lines.push("");
        if( configFile ) {
            lines.push(
                "  browserConfig['"+configName+"'] = require('"+configFile+"');",
            );
        }
        if( configFiles ) {
            lines.push(
                "  browserConfig['"+configName+"'] = [",
                ...(
                    configFiles
                    .map((configFile, i) => {
                        let line = "    require('"+configFile+"')";
                        line += i===configFiles.length-1 ? "" : ",";
                        return line;
                    })
                ),
                "  ];",
            );
        }
    });

    /*
    [
        'renderToDomFile',
        'routerFile',
    ].forEach(propFile => {
        const prop = propFile.slice(0, -1*'File'.length);
        const filePath = config[propFile];
        if( ! filePath ) return;
        lines.push(
            "",
            "  browserConfig['"+prop+"'] = require('"+require.resolve(filePath)+"');",
        );
    });

    const {browserViewWrapperFiles} = config;
    lines.push(
        "",
        "  browserConfig['browserViewWrappers'] = [",
        ...(
            (browserViewWrapperFiles||[])
            .map((browserViewWrapperFile, i) => {
                let line = "    require('"+browserViewWrapperFile+"')";
                if( i !== browserViewWrapperFiles.length-1 ) {
                    line += ",";
                }
                return line;
            })
        ),
        "  ];",
    );
    */

    lines.push(
        "})();",
    );

    const sourceCode = lines.join('\n');

    return sourceCode;
}

function generatePageConfigCode(pageFile) {
    const sourceCode = [
        "(() => {",
        "  const browserConfig = require('"+require.resolve('@reframe/browser/browserConfig')+"');",
        "",
        "  let pageConfig = require('"+pageFile+"');",
        "  pageConfig = (pageConfig||{}).__esModule===true ? pageConfig.default : pageConfig;",
        "",
        "  browserConfig.currentPageConfig = pageConfig;",
        "})();",
    ].join('\n')

    return sourceCode;
}

function getBrowserEntrySpec({pageConfig, pageFile, pageName}) {
    const {browserEntry} = pageConfig;

    const pathToEntry = (browserEntry||{}).pathToEntry || browserEntry;

    let browserEntryPath;
    if( pathToEntry ) {
        const pageDir = pathModule.dirname(pageFile);
        browserEntryPath = pathModule.resolve(pageDir, pathToEntry);
        assert_browserEntryPath({browserEntryPath, pathToEntry, pageName, pageDir});
    } else {
        assert_usage(config.browserEntryFile);
        assert_usage(pathModule.isAbsolute(config.browserEntryFile));
        browserEntryPath = config.browserEntryFile;
    }

    const browserEntrySpec = {
        browserEntryPath,
        doNotIncludePageConfig: (browserEntry||{}).doNotIncludePageConfig,
        doNotInlcudeBrowserConfig: (browserEntry||{}).doNotInlcudeBrowserConfig,
    };

    return browserEntrySpec;
}

function assert_browserEntryPath({browserEntryPath, pathToEntry, pageName, pageDir}) {
    const errorIntro = 'The `browserEntry` of the page config of `'+pageName+'` ';
    assert_usage(
        !pathModule.isAbsolute(pathToEntry),
        errorIntro+'should be a relative path but it is an absolute path: `'+browserEntryPath+'`'
    );
    assert_usage(
        isModule(browserEntryPath),
        errorIntro+'is resolved to `'+browserEntryPath+'` but no file/module has been found there.',
        '`browserEntry` should be the relative path from `'+pageDir+'` to the browser entry file.'
    );
}

function isModule(filePath) {
    try {
        // `require.resolve` throws if `filePath` is not a file
        require.resolve(filePath);
        return true;
    } catch(e) {}
    return false;
}
