const loaderUtils = require('loader-utils')
module.exports = function (source) {
  let result = `
    let style = document.createElement('style')
    style.innerHTML = ${JSON.stringify(source).replace(/\\r\\n/g, '')}
    document.head.appendChild(style)
  `
  this.callback(null, result)
}
