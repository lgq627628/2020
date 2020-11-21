modules = {
  0: function(require, exports) { // index.js
    let text = require('./text.js').text
    let aa = require('./a.js').aa

    let str = `${text} I'm ${aa} years old.`
    console.log(str)
  },
  1: function(require, exports) { // text.js
    let text = 'hello, water!'
    exports.text = text
  },
  2: function(require, exports) { // a.js
    let bb = require('./b.js').bb
    exports.aa = 2 * bb
  },
  3: function(require, exports) { // b.js
    exports.bb = 14
  }
}
