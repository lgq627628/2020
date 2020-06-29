const util = require('util')
const child_process = require('child_process')
const { exec } = child_process

const exec2 = util.promisify(exec) // 但是这个 api 极其容易被注入，如 '. && rm -rf /'，一般用 execFile

exec2('ls -l').then(res => {
    console.log(res.stdout)
})