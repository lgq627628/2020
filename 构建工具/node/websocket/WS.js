
class WS {
  /**
   * @description: 初始化实例属性，保存参数
   * @param {String} url ws的接口
   * @param {Function} msgCallback 服务器信息的回调传数据给函数
   * @param {String} name 可选值 用于区分ws，用于debugger
   */
  constructor(url, msgCallback, name = 'default') {
      this.url = url;
      this.msgCallback = msgCallback;
      this.name = name;
      this.ws = null;  // websocket对象
      this.status = null; // websocket是否关闭
  }
  /**
   * @description: 初始化 连接websocket或重连webSocket时调用
   * @param {*} 可选值 要传的数据
   */
  connect(data) {
      // 新建 WebSocket 实例
      this.ws = new WebSocket(this.url);
      this.ws.onopen = e => {
          // 连接ws成功回调
          this.status = 'open';
          console.log(`${this.name}连接成功`, e)
          // this.heartCheck();
          if (data !== undefined) {
              // 有要传的数据,就发给后端
              return this.ws.send(data);
          }
      }
      // 监听服务器端返回的信息
      this.ws.onmessage = e => {
          // 把数据传给回调函数，并执行回调
          // if (e.data === 'pong') {
          //     this.pingPong = 'pong'; // 服务器端返回pong,修改pingPong的状态
          // }
          return this.msgCallback(e.data);
      }
      // ws关闭回调
      this.ws.onclose = e => {
          this.closeHandle(e); // 判断是否关闭
      }
      // ws出错回调
      this.onerror = e => {
          this.closeHandle(e); // 判断是否关闭
      }
  }
  // heartCheck() {
  //     // 心跳机制的时间可以自己与后端约定
  //     this.pingPong = 'ping'; // ws的心跳机制状态值
  //     this.pingInterval = setInterval(() => {
  //         if (this.ws.readyState === 1) {
  //             // 检查ws为链接状态 才可发送
  //             this.ws.send('ping'); // 客户端发送ping
  //         }
  //     }, 10000)
  //     this.pongInterval = setInterval(() => {
  //         this.pingPong = false;
  //         if (this.pingPong === 'ping') {
  //             this.closeHandle('pingPong没有改变为pong'); // 没有返回pong 重启webSocket
  //         }
  //         // 重置为ping 若下一次 ping 发送失败 或者pong返回失败(pingPong不会改成pong)，将重启
  //         console.log('返回pong')
  //         this.pingPong = 'ping'
  //     }, 20000)
  // }
  // 发送信息给服务器
  sendHandle(data) {
      console.log(`${this.name}发送消息给服务器:`, data)
      return this.ws.send(data);
  }
  closeHandle(e = 'err') {
      // 因为webSocket并不稳定，规定只能手动关闭(调closeMyself方法)，否则就重连
      if (this.status !== 'close') {
          console.log(`${this.name}断开，重连websocket`, e)
          // if (this.pingInterval !== undefined && this.pongInterval !== undefined) {
          //     // 清除定时器
          //     clearInterval(this.pingInterval);
          //     clearInterval(this.pongInterval);
          // }
          this.connect(); // 重连
      } else {
          console.log(`${this.name}websocket手动关闭`)
      }
  }
  // 手动关闭WebSocket
  closeMyself() {
      console.log(`关闭${this.name}`)
      this.status = 'close';
      return this.ws.close();
  }
}
function someFn(data) {
  console.log('接收服务器消息的回调：', data);
}
// const wsValue = new WebSocketClass('ws://121.40.165.18:8800', someFn, 'wsName'); // 这个链接一天只能发送消息50次
const wsValue = new WebSocketClass('wss://echo.websocket.org', someFn, 'wsName'); // 阮一峰老师教程链接
wsValue.connect('立即与服务器通信'); // 连接服务器
// setTimeout(() => {
//     wsValue.sendHandle('传消息给服务器')
// }, 1000);
// setTimeout(() => {
//     wsValue.closeMyself(); // 关闭ws
// }, 10000)
