// 只能执行 node 脚本
const child_process = require('child_process')
const n = child_process.fork('./script.js')
n.on('message', m => {
    console.log('父进程收到的消息：', m)
})
n.send({ data: 'hello' })