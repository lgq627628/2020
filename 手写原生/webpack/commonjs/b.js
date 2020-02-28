// let str = require('./a')

const fs = require('fs')

function req(moduleName) {
  let content = fs.readFileSync(moduleName, 'utf-8')

  let fn = new Function('exports', 'module', 'require', '__dirname', '__filename', content + '\n return module.exports') // 转换之后就是下面这个样子
  // function fn (exports, module, require, __dirname, __filename) {
  //   module.exports = '哈哈哈'
  //   return module.exports
  // }
  let module = {
    exports: {}
  }
  return fn(module.exports, module, req, __dirname, __filename)
}

let str = req('./a.js')

console.log(str)
