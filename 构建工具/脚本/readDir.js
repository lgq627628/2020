const fs = require('fs');
const path = require('path');
// 获取所有命令行命令，包括预设的以及插件的
module.exports.getAllCommands = () => {
    const cwdFns = [];
    const localCwdPath = path.join(__dirname, '..', 'commands');
    const localCwdNames = [...fs.readdirSync(localCwdPath)];

    localCwdNames.forEach((name) => {
        const cwdPath = path.join(localCwdPath, name);
        cwdFns.push(require(cwdPath));
    });
};
