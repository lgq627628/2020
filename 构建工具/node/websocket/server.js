// server.js文件
const express = require('express');
const app = express();
// 设置静态文件夹
// app.use(express.static(__dirname));

// 通过node的http模块来创建一个server服务
const server = require('http').createServer(app);
// WebSocket是依赖HTTP协议进行握手的
const io = require('socket.io')(server);
// 监听客户端与服务端的连接
io.on('connection', function(socket) {
    // send方法来给客户端发消息
    socket.send('青花瓷');
    // 监听客户端的消息是否接收成功
    socket.on('message', function(msg) {
        console.log(msg);  // 客户端发来的消息
        socket.send('天青色等烟雨，而我在等你' );
    });
});
// 监听3000端口
server.listen(7777);
