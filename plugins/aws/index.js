module.exports = {
    $name: require('./package.json').name,
    cliCommands: getCliCommands(),
};

function getCliCommands() {
    return [
        {
            name: 'aws-configure',
            param: '[access-key-id] [secret-access-key] [region]',
            description: `Create/Overwrite ${getConfigFilePath('config', true)} and ${getConfigFilePath('credentials', true)}`,
            action: execAws,
            printAdditionalHelp() {
                const {colorCmd, colorEmphasisLight, colorUrl, indent} = require('@brillout/cli-theme');
                console.log(`${indent}${colorCmd('access-key-id')}        e.g. ${colorEmphasisLight('ABCDEFGHIJ0123456789')}`);
                console.log(`${indent}${colorCmd('secret-access-key')}    e.g. ${colorEmphasisLight('1234567890AbCdEfGhIjKlMnOpQrStUvWxYz0123')}`);
                console.log(`${indent}${colorCmd('region')}               e.g. ${colorEmphasisLight('us-east-1')}`);
                console.log();
                console.log(`${indent}See ${colorUrl('https://docs.aws.amazon.com/cli/latest/topic/config-vars.html')}`);
            }
        },
    ];
}

async function execAws({inputs: [accessKeyId, secretAccessKey, region], printHelp}) {
    if( ! accessKeyId || ! secretAccessKey || ! region ) {
        console.log(cmd);
        console.log(accessKeyId);
        console.log(secretAccessKey);
        console.log(region);
        printHelp();
        return;
    }

    const fs = require('fs-extra');
    const {symbolSuccess} = require('@brillout/cli-theme');
    await fs.mkdirp(getConfigFolderPath());
    console.log(`${symbolSuccess}${getConfigFolderPath(true)} created.`);

    fs.writeFileSync(getConfigFilePath('config'), `
[default]
region = ${region}
`, 'utf-8');
    console.log(`${symbolSuccess}${getConfigFilePath('config', true)} created.`);

    fs.writeFileSync(getConfigFilePath('credentials'), `
[default]
aws_access_key_id = ${accessKeyId}
aws_secret_access_key = ${secretAccessKey}
`, 'utf-8');
    console.log(`${symbolSuccess}${getConfigFilePath('credentials', true)} created.`);
}

function getConfigFilePath(name, pretty=false) {
    let result = require('path').join(getConfigFolderPath(), name);
    if (pretty) {
        const {colorFile, strFile} = require('@brillout/cli-theme');
        result = colorFile(strFile(result));
    }
    return result;
}

function getConfigFolderPath(pretty=false) {
    let result = require('path').join(require('os').homedir(), '.aws');
    if (pretty) {
        const {colorDir, strDir} = require('@brillout/cli-theme');
        result = colorDir(strDir(result));
    }
    return result;
}
