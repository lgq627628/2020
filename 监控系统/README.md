## 捕获异常 || 异常处理
参考：https://www.jianshu.com/p/c1761c8c25ab

### 一、需要处理哪些异常
js语法错误、代码异常
AJAX请求异常
静态资源加载异常
Promise异常
Iframe异常
跨域Script error
崩溃和卡顿

### 二、处理方法
try-catch：只能捕获到同步运行时错误。对异步错误无法处理，并且对语法错误（SyntaxError）也捕获不到
window.onerror：能异步错误能捕获到，但是语法错误捕获不到，同时静态资源异常，接口异常都捕获不到
静态资源异常可以通过window.addEventListener('error', () => {}）捕获，但是受兼容性影响
Promise Catch：可以增加全局的window.addEventListener("unhandledrejection"，() => {}）方法监听。处理漏掉的没有被catch到的promise异常。
vue中：Vue.config.errorHandler = () => {}
react：componentDidCatch
React error boundary：像组件一样使用即可，然后再componentDidCatch中根据错误渲染不同组件。

## 监控指标计算

- 白屏 https://juejin.cn/post/6977320637014474765

## 自动化测试

- 访问目标页面，对页面进行截图；
- 设置 UA（模拟不同渠道：微信、手Q、其它浏览器等）；
- 模拟用户点击、滑动页面操作；
- 网络拦截、模拟异常情况（接口响应码 500、接口返回数据异常）；
- 操作缓存数据（模拟有无缓存的场景等）。

参考：https://mp.weixin.qq.com/s/VhvXTNuM7TSfFtzBVmhTyg

## 参考代码库
- https://github.com/getsentry/sentry-javascript/blob/develop/packages/utils/src/instrument.ts#L571
- https://github.com/clouDr-f2e/monitor/blob/master/packages/browser/src/handleEvents.ts