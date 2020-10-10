// 能用 spawn 就不要用 exec，因为 exec 有回调会有大小限制，并且 spawn 只支持事件流
const child_process = require('child_process')
const { execFile } = child_process

execFile('ls', ['-l', '..'], (err, stdout) => {
    console.log(err)
    console.log(stdout)
})