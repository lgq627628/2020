// 我们希望最终输出的 bundle.js 文件大概长下面这样。
// 本质就是字符串的拼接，通过读取入口文件，分析依赖，想尽各种办法生成下面这样的代码即可。
let modules = {
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
}

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

