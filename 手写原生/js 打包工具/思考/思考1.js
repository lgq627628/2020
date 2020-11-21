// index.js
function(require, exports) {
  let text = require('./text.js').text
  let aa = require('./a.js').aa

  let str = `${text} I'm ${aa} years old.`
  console.log(str)
}

// text.js
function(require, exports) {
  let text = 'hello, water!'
  exports.text = text
}

// a.js
function(require, exports) {
  let bb = require('./b.js').bb
  exports.aa = 2 * bb
}

// b.js
function(require, exports) {
  exports.bb = 14
}
