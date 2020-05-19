const express = require('express')
const Server = require('ws').Server;

const app = express()
app.use(express.static(__dirname));
app.listen(1202)

const ws = new Server({ port: 7777 });

ws.on('connection', function(socket) {
  // 监听客户端发来的消息
  socket.on('message', function(msg) {
      // 这个就是客户端发来的消息
      console.log(msg);
      // 来而不往非礼也，服务端也可以发消息给客户端
      socket.send(`这里是服务端对你说的话： ${msg}`);
  });
});
