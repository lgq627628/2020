// 这边是 bundle.js 的另一种写法，也就是用立即执行函数包起来，modules 当作参数传递，这样可以避免影响到全局

(function (modules) {
  function handle(id) {
    let [fn, mapping] = modules[id]
    let exports = {}
    function require(path) {
      return handle(mapping[path])
    }
    fn(require, exports)
    return exports
  }
  handle(0)
})({
  0: [function(require, exports) {
    // index.js
  }, {
    './text.js': 1,
    './a.js': 2
  }],
  1: [function(require, exports) {
    // text.js
  }, {}],
  2: [function(require, exports) {
    // a.js
  }, {
    './b.js': 3,
  }],
  3: [function(require, exports) {
    // b.js
  }, {}]
})




