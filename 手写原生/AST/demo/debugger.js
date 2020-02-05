/**
 * 本例子的作用是移除代码中的 debugger
 * 官方移除 debugger 写法案例： https: //github.com/babel/minify/blob/master/packages/babel-plugin-transform-remove-debugger/src/index.js
 * 官方移除 console.log 写法案例： https: //github.com/babel/minify/blob/master/packages/babel-plugin-transform-remove-console/src/index.js
 */
let parser = require('@babel/parser'); // 把 js 字符串代码转成 ast
let traverse = require('@babel/traverse'); // 遍历 ast
let generator = require('@babel/generator'); // 把新的 ast 生成新的 js 字符串

// 还可以这样安装 => npm install @babel/{core,types,traverse,generator}
// 可以在该网址查看在线 ast 的效果（https://astexplorer.net/）
function compile(code) {
  // 1、把字符串解析成语法树，固定写法，一般不用改
  let ast = parser.parse(code)

  // 2、遍历语法数找到 debugger 并移除，我们做的大部分操作都在这里
  let visitor = {
    DebuggerStatement(path) { // 要对哪种类型做修改，这里是 DebuggerStatement 类型，path 是树的路径
      path.remove();
    }
  }
  traverse.default(ast, visitor)

  // 3、将新的语法数转回成字符串，固定写法，一般不用改
  return generator.default(ast, {}, code)
}

let code = `
  function fn() {
    debugger
    console.log('hello')
  }
  debugger
`

let result = compile(code)
console.log(result.code)
