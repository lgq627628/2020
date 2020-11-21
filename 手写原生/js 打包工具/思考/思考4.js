let modules = {
  0: [
    function(require, exports) { // index.js
      let text = require('./text.js').text
      let aa = require('./a.js').aa

      let str = `${text} I'm ${aa} years old.`
      console.log(str)
    },
    {
      './text.js': 1,
      './a.js': 2
    }],
  1: [
    function(require, exports) { // text.js
      let text = 'hello, water!'
      exports.text = text
    }, {}],
  2: [
    function(require, exports) { // a.js
      let bb = require('./b.js').bb
      exports.aa = 2 * bb
    }, {
      './b.js': 3,
    }],
  3: [
    function(require, exports) { // b.js
      exports.bb = 14
    }, {}]
}


function handle(id) {
  let [fn, mapping] = modules[id]
  let exports = {}

  function require(path) {
    // mapping[path] 就是对应模块的 id
    return handle(mapping[path]) // 就是 return exports 对象，这样我们就能够拿到导出的值
  }

  fn(require, exports)

  return exports
}
handle(0)
