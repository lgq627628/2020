/**
 * 本例子的作用是在 console.log('函数名','xx') 的第一个参数加上调用它的函数名字
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
    CallExpression(path) { // 要对哪个类型做修改（CallExpression 是函数类型调用表达式）
      let node = path.node
      let {callee, arguments} = node
      if ( // 判断是不是 console.log
        t.isMemberExpression(callee) &&
        callee.object.name === 'console' &&
        callee.property.name === 'log'
      ) {
        let parentFnPath = path.findParent(p => p.isFunctionDeclaration()) // 向上找到是函数类型的父路径
        let fnName = parentFnPath.node.id.name
        let strObj = t.stringLiteral(fnName) // 需要转成字面量
        arguments.unshift(strObj) // 在参数头部中插入函数名
      }
    }
  }
  traverse.default(ast, visitor)

  // 3、将新的语法数转回成字符串
  return generator.default(ast, {}, code)
}

let code = `
  function sum() {
    console.log('hello')
  }
`

let result = compile(code)
console.log(result.code)
