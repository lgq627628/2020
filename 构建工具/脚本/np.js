// 批量发包
const fs = require('fs-extra');
const path = require('path');
const spawnSync = require('child_process').spawnSync;

const lernaInfo = require('../lerna.json');

const version = lernaInfo.version;

const tagIndex = process.argv.indexOf('--tag');

const tag = tagIndex === -1 ? 'latest' : process.argv[tagIndex + 1];

spawnSync('lerna', ['version', '--force-publish'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '../'),
});

const newVersion = fs.readJSONSync(path.join(__dirname, '../lerna.json')).version;

if (newVersion === version) {
    return;
}

const packages = spawnSync('lerna', ['list', '--json']);

JSON.parse(packages.stdout.toString()).map((item) => {
    if (tag) {
        return spawnSync('jnpm', ['publish', '--tag', tag], {
            stdio: 'inherit',
            cwd: item.location,
        });
    }

    return spawnSync('jnpm', ['publish'], {
        stdio: 'inherit',
        cwd: item.location,
    });
});
