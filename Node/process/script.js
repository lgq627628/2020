process.on('message', m => {
    console.log('子进程收到的消息：', m)
})

setTimeout(() => {
    process.send({ data: 'hi' })
}, 3000);