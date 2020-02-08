## 如何判断 this 指向

- 看方法前面有没有 . 操作符，有的话就指向 . 前面的对象，没有就指向 window（严格模式下是 undefined）
- 构造函数里面的 this 指向实例，包括 prototype 里面的 this 也是指向实例
- 绑定事件函数 this 指向绑定的元素，也就是当期操作元素
- 定时器里面的 this 指向 window，相当于 `window.setTimeout()`
- 立即执行函数里面的 this 指向 window
- 箭头函数中没有 this，应该去上下文中找
