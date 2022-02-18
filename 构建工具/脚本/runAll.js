// 同时执行多个项目的脚本
const childProcess = require('child_process');
const path = require('path');

const filePath = {
    vue2: path.join(__dirname, '../vue2'),
    vue3: path.join(__dirname, '../vue3'),
    react15: path.join(__dirname, '../react15'),
    react16: path.join(__dirname, '../react16'),
    service: path.join(__dirname, '../service'),
    main: path.join(__dirname, '../main')
}

function runAll(filePath) {
    Object.values(filePath).forEach(path => {
        // 进入到对应的子目录并启动项目
        const cmd = `cd ${path} && npm start`;
        childProcess.spawn(cmd, {
            stdio: 'inherits',
            shell: true
        });
    });
}

runAll(filePath);

