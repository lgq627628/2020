## node 执行流程

1. Node 源码有一坨依赖，大部分是 C/C++ 底层
2. Node 启动入口是 node_main.cc 的 main 函数
3. 入口函数找到 node.cc 的 3 个 Start，依次调用
4. node.cc 的第一个 Start 初始化了 v8，调用第二个 Start
5. 第二个 Start 让 v8 准备了引擎实例，调用第三个 Start
6. 第三个 Start
    6.1 首先准备了 v8 的上下文 Context
    6.2 其次准备了 Node 的启动环境，对各种需要的变量做整理
    6.3 再把 Node 原生模块和我们的 JS 代码都加载进来运行
    6.4 最后把主持人 libuv 请上场，执行 JS 里的各种任务
7. libuv 没活干了，就一层层来退出进程、收拾场地，退出程序

## 常用基础 API
- process.cwd()：当前Node.js进程执行时的文件夹地址
## 参考文章
- https://github.com/theanarkh/understand-nodejs
- https://zhuanlan.zhihu.com/p/375276722


## 名词解释
- 多用户：强调的是“用”，比如你是某宝的用户，你使用了它的服务。
- 多租户：强调的是“租”，一定是有什么资源租给你了。比如你使用阿里云的存储服务，阿里是“租”给你它的存储设备，你是它的租户，别人不会看见你存储的数据，就像你租的房子别人不能翻查一样。当然同时你也是阿里云网站的用户。
- 多用户是一个应用给不同用户。多租户是不同应用在同一个基础设施上


## koa
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9bb731d5ff6a47f5841122f00412376e~tplv-k3u1fbpfcp-watermark.image?)
但是大家并不需要过度担心这个副作用，首先，系统日常运行中，并不会有单一服务器会承受这么高的`QPS`。一般来说生产环境单机`QPS`也就维持在100 ~ 400之间。所以这个副作用并不会对我们的系统造成真正意义上的负面影响。

## 接口如何防刷
1：网关控制流量洪峰，对在一个时间段内出现流量异常，可以拒绝请求（参考个人博客文章https://mp.csdn.net/postedit/81672222）
2：源ip请求个数限制。对请求来源的ip请求个数做限制
3：http请求头信息校验；（例如host，User-Agent，Referer）
4：对用户唯一身份uid进行限制和校验。例如基本的长度，组合方式，甚至有效性进行判断。或者uid具有一定的时效性
5：前后端协议采用二进制方式进行交互或者协议采用签名机制
6：人机验证，验证码，短信验证码，滑动图片形式，12306形式


## 常用库
https://nodejstoolbox.com/

## 免费下载视频
https://github.com/FrontEndGitHub/FrontEndGitHub/issues/30
## 问题答疑
- stream 可以通过缓冲区来高效利用内存，从而提高性能。常用场景如读写大文件、http-server 中的大静态文件渲染。每一个 stream 都有 pipe 函数，可以用来判断一个对象是否 stream。