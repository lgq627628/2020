// 能用 spawn 就不要用 exec，因为 exec 有回调会有大小限制
const child_process = require('child_process')
const { spawn } = child_process

const streams = spawn('ls', ['-l', '..'])
const buffers = []
streams.stdout.on('data', chunk => {
    console.log(chunk.toString())
    buffers.push(chunk)
})
// streams.stdout.on('end', chunk => {
//     console.log(buffers.join('').toString())
// })