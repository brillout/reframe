const getPackages = require('./getPackages');
const assert = require('reassert');
const {symbolSuccess} = require('@brillout/cli-theme');

assert(process.argv.length===3);
const npmTag = process.argv[2];
assert(npmTag);

addNpmTag(npmTag);

function addNpmTag(npmTag) {
    getPackages()
    .forEach(({exec, packageNameAndVersion}) => {
        await exec('npm', ['dist-tag', 'add', packageNameAndVersion, npmTag]);
        console.log(symbolSuccess+'tag '+npmTag+' added to '+packageNameAndVersion);
    });
}
