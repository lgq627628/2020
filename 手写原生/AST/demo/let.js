/**
 * 本例子的作用是把 let 声明改成 var 声明
 */
let parser = require('@babel/parser'); // 把 js 字符串代码转成 ast
let traverse = require('@babel/traverse'); // 遍历 ast
let t = require('@babel/types') // 方便对 ast 进行修改的工具库，类似于 lodash
let generator = require('@babel/generator'); // 把新的 ast 生成新的 js 字符串

function compile(code) {
  // 1、把字符串解析成语法树
  let ast = parser.parse(code)

  // 2、遍历语法数并修改
  let visitor = {
    VariableDeclaration(path) { // 找到 let 标识符，其中 path 是树的路径
      let node = path.node
      if (node.kind === 'let') node.kind = 'var'
    }
  }
  traverse.default(ast, visitor)

  // 3、将新的语法数转回成字符串
  return generator.default(ast, {}, code)
}

let code = `let a = 1`

let result = compile(code)
console.log(result.code)
