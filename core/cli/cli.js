#!/usr/bin/env node

const program = require('commander');
const pkg = require('./package.json');
const fs = require('fs-extra');
const path = require('path');
let argValue;

program
    .version(pkg.version, '-v, --version')
    .command('init <project-name>')
    .description('creates new project scaffolding')
    .action( (project) => {
        argValue = 'init';
        createScaffold(project);
    });

program
    .command('start')
    .description('starts dev server on localhost')
    .action( () => {
        argValue = 'start';
        start();
    });

program
    .arguments('<arg>')
    .action((arg) => {
        argValue = arg;
        console.error(`Sorry, ${arg} is not a valid command!  Please use -h or --help for valid commands.`);
    });

program.parse(process.argv);

if (typeof argValue === 'undefined') {
    console.error('No command given!  Please use -h or --help for valid commands.');
    process.exit(1);
}

//process.on('unhandledRejection', err => {throw err});

//start();

function start() {
    const {opts, cwd} = get_cli_args();

    if( opts.prod ) {
        process.env['NODE_ENV']='production';
    }

    const {pagesDirPath, reframeConfigPath, appDirPath} = find_files(cwd);

    const reframeConfig = reframeConfigPath && require(reframeConfigPath);

    startHapiServer({pagesDirPath, reframeConfig, appDirPath});
}

async function startHapiServer({pagesDirPath, reframeConfig, appDirPath}) {
    const {createHapiServer} = require('@reframe/server/createHapiServer');

    const {server} = await createHapiServer({
        pagesDirPath,
        reframeConfig,
        appDirPath,
        logger: {onFirstCompilationSuccess: log_build_success},
    });

    await server.start();

    log_server_started(server);
}

function find_files(cwd) {
    const {find_app_files} = require('@reframe/utils/find_app_files');
    const assert = require('reassert');
    const assert_internal = assert;
    const assert_usage = assert;

    const {pagesDirPath, reframeConfigPath, appDirPath} = find_app_files(cwd);

    log_found_file(reframeConfigPath, 'Reframe config');
    log_found_file(pagesDirPath, 'Pages directory');

    assert_usage(
        pagesDirPath,
        "Can't find `pages/` directory."
    );
    assert_internal(appDirPath);

    return {pagesDirPath, reframeConfigPath, appDirPath};
}

function get_cli_args() {
    const assert = require('reassert');
    const assert_usage = assert;
    const path_module = require('path');

    const cli_args = process.argv.slice(2);
    const cli_args_opts = cli_args.filter(arg => arg.startsWith('--'));
    const cli_args_input = cli_args.filter(arg => !arg.startsWith('-'));
    assert_usage(
        cli_args_input.length<=1,
        "Too many arguments."
    );

    const cwd = path_module.resolve(process.cwd(), cli_args_input[0]||'');

    const opts = {};
    cli_args_opts.forEach(arg => {
        const opt_name = arg.slice(2);
        opts[opt_name] = true;
    });

    return {
        opts,
        cwd,
    };
}

function log_build_success({compilationInfo}) {
    const chalk = require('chalk');
    const browser_compilation_info = compilationInfo[0];
    const {output: {dist_root_directory}} = browser_compilation_info;
    console.log(green_checkmark()+' Frontend uwi built at '+dist_root_directory+' '+env_tag());

    return;

    function env_tag() {
        return (
            is_production() ? (
                chalk.yellow('[PROD]')
            ) : (
                chalk.blueBright('[DEV]')
            )
        );
    }

    function is_production() {
        return process.env.NODE_ENV === 'production';
    }
}

function log_found_file(file_path, description) {
    const {path_relative_to_homedir} = require('@reframe/utils/path_relative_to_homedir');
    if( file_path ) {
        console.log(green_checkmark()+' '+description+' found at '+path_relative_to_homedir(file_path));
    }
}

function log_server_started(server) {
    console.log(green_checkmark()+' Server running at '+server.info.uri);
}

function green_checkmark() {
    const chalk = require('chalk');
    return chalk.green('\u2714');
}

async function createScaffold(projectName) {
    const {homeViewTemplate, homePageTemplate} = require('./templates/homeTemplate');
    const {jsonPkgTemplate} = require('./templates/jsonPkgTemplate');
    const viewTemplate = homeViewTemplate();
    const pageTemplate = homePageTemplate(projectName);
    const pkgTemplate = jsonPkgTemplate(projectName);
    let currentDir = path.resolve(process.cwd(), projectName);

    // add files to projectname/app/views
    try {
        let tempPath = path.resolve(currentDir, 'app', 'views');
        let fileName = 'homeView.js';
        await fs.outputFile(path.resolve(tempPath, fileName), viewTemplate);
    } catch (err) {
        console.log(err);
    }

    // add files to projectName/app/pages
    try {
        let tempPath = path.resolve(currentDir, 'app', 'pages');
        let fileName = 'homePage.html.js';
        await fs.outputFile(path.resolve(tempPath, fileName), pageTemplate);
    } catch (err) {
        console.log(err);
    }

    // add files to projectName root directory
    try {
        let fileName = 'package.json';
        await fs.outputFile(path.resolve(currentDir, fileName), pkgTemplate);
    } catch (err) {
        console.log(err);
    }
}