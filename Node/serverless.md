## 如何将传统 Web 框架部署到 Serverless
参考文章（写的不错）：https://juejin.cn/post/

### 传统应用
- 购买云主机，自己部署和维护
- 入口文件：
    ```js
    const express = require('express')
    const app = express()
    const port = 3000

    // 监听 / 路由，处理请求
    app.get('/', (req, res) => {
      res.send('Hello World!')
    })

    // 监听 3000 端口，启动 HTTP 服务
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    })
    ```
- 可以看到传统 Express 应用是：
    1.通过 app.listen() 启动了 HTTP 服务，其本质上是调用的 Node.js http 模块的 createServer() 方法创建了一个 HTTP Server
    2.监听了/路由，由回调函数function(request, response)处理请求


### 函数计算
- Serverless 应用中， FaaS 是基于事件触发的，触发器是触发函数执行的方式：API 网关触发器 + HTTP 触发器
- 入口函数
  - API 网关触发器的入口函数形式
    ```js
          /*
        * handler: 函数名 handler 需要与创建函数时的 handler 字段相对应。例如创建函数时指定的 handler 为 index.handler，那么函数计算会去加载 index.js 文件中定义的 handler 函数
        *	event: 您调用函数时传入的数据，其类型是 Buffer，是函数的输入参数。您在函数中可以根据实际情况对 event 进行转换。如果输入数据是一个 JSON 字符串 ，您可以把它转换成一个 Object。
        * context: 包含一些函数的运行信息，例如 request Id、 临时 AK 等。您在代码中可以使用这些信息
        * callback: 由系统定义的函数，作为入口函数的入参用于返回调用函数的结果，标识函数执行结束。与 Node.js 中使用的 callback 一样，它的第一个参数是 error，第二个参数 data。
        */
        module.exports.handler = (event, context, callback) => {

          // 处理业务逻辑
          callback(null, data);

        };
    ```
  - HTTP 触发器的入口函数形式
    ```js
      module.exports.handler = function(request, response, context)  {
      response.send("hello world");
    }
    ```

### 差异对比
对比可以看出，在传统应用中，是启动一个服务监听端口号去处理 HTTP 请求，服务处理的是 HTTP 的请求和响应参数；而在 Serverless 应用中， Faas 是基于事件触发的，触发器类型不同，参数映射和处理不同：

若是 API 网关触发器:
当有请求到达后端服务设置为函数计算的 API 网关时，API 网关会触发函数的执行，触发器会将事件信息生成 event 参数，然后 FaaS 以 event 为参数执行入口函数，最后将执行结果返回给 API 网关。所以传统应用和 Serverless 应用在请求响应方式和参数的数据结构上都有很大差异，要想办法让函数计算的入口方法适配 express。

若是 HTTP 触发器:
相对 API 网关触发器参数处理会简单些。因为 HTTP 触发器通过发送 HTTP 请求触发函数执行，会把真实的 HTTP 请求直接传递给 FaaS 平台，不需要编码或解码成 JSON 格式，不用增加转换逻辑，性能也更优。

Web 应用若想 Serverless 化需要开发一个适配层，将函数计算接收到的请求转发给 express 应用处理，最后再返回给函数计算。


### 代码示例
传统服务还是需要的，只不过要包一层
```js
// index.js
const express = require('express');

const Server = require('./server.js'); 

const app = express();
app.all('*', (req, res) => {
  res.send('express-app hello world!');
});

const server = new Server(app); // 创建一个自定义 HTTP Server

module.exports.handler = function(event, context, callback) {
  server.proxy(event, context, callback); // server.proxy 将函数计算的请求转发到 express 应用
};

```