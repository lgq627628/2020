let modules = { 0: [function(require, exports) {
      let text = require('./text.js').text
let aa = require('./a.js').aa

let str = `${text} I'm ${aa} years old.`
console.log(str)

    }, {"./text.js":1,"./a.js":2} ],1: [function(require, exports) {
      let text = 'hello, water!'
exports.text = text

    }, {} ],2: [function(require, exports) {
      let bb = require('./b.js').bb
exports.aa = 2 * bb;

    }, {"./b.js":3} ],3: [function(require, exports) {
      exports.bb = 14

    }, {} ], }
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



