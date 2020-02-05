/**
 * 本例子的作用是把箭头函数转换成普通函数
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
    ArrowFunctionExpression(path) { // 找到箭头函数，其中 path 是树的路径
      let node = path.node
      let {params, body} = node // 拿到箭头函数的参数和执行体
      let newFn = t.functionExpression(null, params, body, false, false) // 生成普通函数
      path.replaceWith(newFn)
    }
  }
  traverse.default(ast, visitor)

  // 3、将新的语法数转回成字符串
  return generator.default(ast, {}, code)
}

let code = `let sum = (a,b) => {return a+b}`

let result = compile(code)
console.log(result.code)
