## 如何判断 this 指向

- 看方法前面有没有 . 操作符，有的话就指向 . 前面的对象，没有就指向 window（严格模式下是 undefined，node 环境中是 global）
- 构造函数里面的 this 指向实例，包括 prototype 里面的 this 也是指向实例
- 绑定事件函数 this 指向绑定的元素，也就是当期操作元素
- 定时器里面的 this 指向 window，相当于 `window.setTimeout()`
- 立即执行函数里面的 this 指向 window
- 箭头函数中没有 this，应该去上下文中找，如果箭头函数绑定到某一个 obj，其绑定是无法更改的，new 也不行
- 通过 bind 方法绑定的 this 是永久性的绑定，之后再用 call、bind、apply 都是无效的，但是 new 可以，因为 bind 内部判断了是否是 new 出来的，如果是则以 new 的为准
