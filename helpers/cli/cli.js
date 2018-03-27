#!/usr/bin/env node

const program = require('commander');
const pkg = require('./package.json');
const fs = require('fs-extra');
const path = require('path');
const spawn = require('cross-spawn');
const inquirer = require('inquirer');
const cwd = process.cwd();
const {pagesDirPath, reframeConfigPath, appDirPath} = find_files(cwd);
const {questions} = require('./questions');
let argValue;

process.on('unhandledRejection', err => {
    console.log(err);
    process.exit(1);
});

if (pagesDirPath && reframeConfigPath) {

    const reframeConfig = reframeConfigPath && require(reframeConfigPath);
    const {processReframeConfig} = require('@reframe/utils/processReframeConfig/processReframeConfig');

    processReframeConfig(reframeConfig);

    const cliCommands = reframeConfig._processed.cli_commands;

    program
    .version(pkg.version, '-v, --version')
    .command('start')
    .description('starts dev server on localhost')
    .option("-p, --production", "start for production")
    .option("-l, --log", "prints build and page information")
    .action( (options) => {
        argValue = 'start';
        start(options.production, options.log);
    });

    program
    .command('config')
    .description('processReframeConfig')
    .action( () => {
        argValue = 'config';
        //console.log(cliCommands);
        cliCommands.forEach(command => {
            console.log(command);
        });
    });

    cliCommands.forEach(command => {
        program
        .command(command.name)
        .description(command.description)
        .action(command.action);
    });
} else {
    program
    .version(pkg.version, '-v, --version')
    .command('init')
    .description('creates new project')
    .action( () => {
        argValue = 'init';
        //createScaffold(project);
        inquirer.prompt(questions).then(({projectName, useRedux, plugins}) => {
            initApp(projectName, useRedux, plugins);
        });
    });
}

program
    .command('log')
    .description('logs info')
    .action( () => {
        argValue = 'log';
        console.log('check for something');
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

async function initApp(projectName, useRedux, plugins) {
    await createScaffold(projectName);
    //await configureApp(projectName);
}

function configureApp(projectName) {
    //unnecessary for now, but leaving for future use.
}

function start(prod, showHapiServerLog) {

    if( prod ) {
        process.env['NODE_ENV']='production';
    }

    const {pagesDirPath, reframeConfigPath, appDirPath} = find_files(cwd);

    const reframeConfig = reframeConfigPath && require(reframeConfigPath);

    startHapiServer({pagesDirPath, reframeConfig, appDirPath, showHapiServerLog});
}

async function startHapiServer({pagesDirPath, reframeConfig, appDirPath, showHapiServerLog}) {
    const createHapiServer = require('@reframe/server/createHapiServer');

    const {server} = await createHapiServer({
        pagesDirPath,
        reframeConfig,
        appDirPath,
        logger: {onFirstCompilationSuccess: log_build_success},
        log: showHapiServerLog
    });

    await server.start();

    log_server_started(server);
}

function find_files(cwd) {
    const {find_app_files} = require('@reframe/utils/find_app_files');
    // const assert = require('reassert');
    // const assert_internal = assert;
    // const assert_usage = assert;

    const {pagesDirPath, reframeConfigPath, appDirPath} = find_app_files(cwd);

    log_found_file(reframeConfigPath, 'Reframe config');
    log_found_file(pagesDirPath, 'Pages directory');

    // assert_usage(
    //     pagesDirPath || reframeConfigPath,
    //     "Can't find `pages/` directory nor `reframe.config.js` file."
    // );
    // assert_internal(appDirPath);

    return {pagesDirPath, reframeConfigPath, appDirPath};
}

function log_build_success({compilationInfo}) {
    const chalk = require('chalk');
    const browser_compilation_info = compilationInfo[0];
    const {output: {dist_root_directory}} = browser_compilation_info;
    console.log(green_checkmark()+' Frontend built at '+dist_root_directory+' '+env_tag());

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
    const relative_to_homedir = require('@brillout/relative-to-homedir');
    if( file_path ) {
        console.log(green_checkmark()+' '+description+' found at '+relative_to_homedir(file_path));
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
    const {jsonPkgTemplate, reframeConfigTemplate} = require('./templates/coreFilesTemplate');
    const viewTemplate = homeViewTemplate();
    const pageTemplate = homePageTemplate(projectName);
    const pkgTemplate = jsonPkgTemplate(projectName);
    const configTemplate = reframeConfigTemplate();
    let currentDir = path.resolve(process.cwd(), projectName);

    // add files to projectName/views
    let viewPath = path.resolve(currentDir, 'views');
    let viewFileName = 'homeView.js';
    await fs.outputFile(path.resolve(viewPath, viewFileName), viewTemplate);

    // add files to projectName/pages
    let pagePath = path.resolve(currentDir, 'pages');
    let pageFileName = 'homePage.config.js';
    await fs.outputFile(path.resolve(pagePath, pageFileName), pageTemplate);

    // add files to projectName root directory
    let pkgFileName = 'package.json';
    let configName = 'reframe.config.js';
    await fs.outputFile(path.resolve(currentDir, pkgFileName), pkgTemplate);
    await fs.outputFile(path.resolve(currentDir, configName), configTemplate);

    install(currentDir);
}

function install(directory) {
    const child = spawn('npm', ['install'], { stdio: 'inherit', cwd: directory });

    child.stdout.on('data', data => {
        console.log(data);
    });

    child.on('close', code => {
        console.log(`process completed with code: ${code}`);
    });
}
