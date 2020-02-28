// 手写 webpack
// 执行 node webpack.js | highlight 即可生成可以在浏览器中运行的代码
const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser') // 这个可以解析成 ast，从而获得 import 部分的内容
const traverse = require('@babel/traverse').default // 这个就是遍历 ast 的意思，遍历过程中可以对需要的部分进行处理，加个 default，因为它默认是 esm 的导出
const babel = require('@babel/core') // 其中一个功能是把 ast 转成浏览器可以运行的代码

const moduleAnalyser = (filename) => { // 单个文件分析方法，后面可递归
  // 读取入口文件内容
  const content = fs.readFileSync(filename, 'utf-8')
  // 获取依赖
  const ast = parser.parse(content, {
    sourceType: 'module' // 说明是 es6 语法
  })
  const dependencies = {}
  traverse(ast, {
    ImportDeclaration({ node }) {
      let relativePath = node.source.value
      const dirname = path.dirname(filename)
      const absolutePath = './' + path.join(dirname, relativePath)
      dependencies[relativePath] = absolutePath // 因为后期可能要用到不同的路径方式
    }
  })
  const {code} = babel.transformFromAst(ast, null, { // 把 ast 转成浏览器可运行的代码
    presets: ['@babel/preset-env'] // 把 es6 转成 es5，presets 是插件集合的意思，plugins 是单个插件，好比套餐和单点的关系
  })

  return {
    filename,
    dependencies,
    code
  }
}

const makeDependenciesGraph = (entry) => { // 依赖递归分析
  const entryModule = moduleAnalyser(entry)
  const graphArr = [entryModule] // 栈结构递归
  for (let i = 0; i < graphArr.length; i++) {
    let nowModule = graphArr[i]
    let {dependencies} = nowModule
    for (const key in dependencies) {
      let depModule = moduleAnalyser(dependencies[key])
      graphArr.push(depModule)
    }
  }
  const graph = graphArr.reduce((pre, next) => { // 这里仅仅做一个数据格式转换
    pre[next.filename] = { dependencies: next.dependencies, code: next.code }
    return pre
  }, {})
  return graph
}

const generateCode = (entry) => { // 把依赖串联起来并生成最终的 code，就是字符串
  const graph = JSON.stringify(makeDependenciesGraph(entry)) // 得转成字符串，否则就是 [object Object]

  return `
    // 下面的内容最好加上分号，不然可能会报错
    // 其实就是执行 graph 里面的每个 code，如果有依赖，就先执行依赖里面的 code
    (function(graph) {

      function require(module) {

        function localRequire(relativePath) { // 除了第一次，之后都需要把相对转换成绝对路径，如果你在前面 traverse 遍历的时候直接把路径给改了，就不用这一步了，就直接递归 require 就行
          return require(graph[module].dependencies[relativePath])
        }
        let exports = {}; // 单纯的是个对象，用来存取导入导出的东西

        (function(require, exports, code) {
          eval(code) // 其实就是拿到 code 并执行，但是里面没有 require 和 exports，需要我们创建
        })(localRequire, exports, graph[module].code) // 执行代码，传入当前模块相关信息

        return exports;
      };

      require('${entry}') // 注意这里要加上单引号
    })(${graph})
  `
}

let code = generateCode('./src/index.js')
fs.writeFileSync('./dist/main.js', code)
