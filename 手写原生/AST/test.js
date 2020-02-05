/**
 * 这个不是依赖 babel，是用最原始的依赖 esprima、estraverse 和 escodegen 做的，所以可以跳过不看，直接看当前目录下 demo 里面的例子
 * 本例子的作用把 ast 函数的名字改成 newAst
 * 1、 用 esprima 解析我们的 js 代码 => 语法树（ 就是个对象， 这个对象可以描述我们写的代码）
 * 2、 用 estraverse 遍历树（ 先序深度优先） => 更改树的内容
 * 3、 用 escodegen 生成新的内容
 */
const esprima = require('esprima') // 用来解析语法
const estraverse = require('estraverse') // 用来遍历树
const escodegen = require('escodegen') // 用来生成代码

// 可以在该网址查看在线 ast 的效果（https://esprima.org/demo/parse.html）
let code = `function ast() {}`

let tree = esprima.parseScript(code)
console.log(tree)

estraverse.traverse(tree, {
  enter(node){ // 一般我们用这个就行
    console.log('enter', node.type)
    if (node.type === 'Identifier') {
      node.name = 'newAst'
    }
  },
  leave(node) {
    console.log('leave', node.type)
  }
})

let newCode = escodegen.generate(tree)
console.log(newCode)
