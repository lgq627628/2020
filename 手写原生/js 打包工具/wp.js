const fs = require('fs')
const path = require('path');

let ID = 0; // 自增 ID

function getDependencies(str) { // 获取文件对应的依
  let rs = str.match(/require\('(.+)'\)/g) // [ "require('./text.js')", "require('./a.js')" ]
  rs = rs ? rs.map(r => r.slice(9, -2)) : [] // [ "./text.js", "./a.js" ]
  return rs
}

function createAsset(filename) { // filename 大概长这个样子：'./src/index.js'
  let fileStr = fs.readFileSync(filename, 'utf8') // js 文件读出来就是个字符串
  return {
    id: ID++,
    filename,
    dependencies: getDependencies(fileStr),
    code: `function(require, exports) {
      ${fileStr}
    }`
  }
}

function createAssetArr(filename) {
  let entryModule = createAsset(filename)
  let moduleArr = [entryModule] // 这里用来存放所有模块，也就是所有文件

  for(let m of moduleArr) { // 目前 moduleArr 只有一个入口模块，但是下面解析依赖的时候会往 moduleArr 里面继续追加模块，所以会继续向后循环，而不是只循环一次
    let dirname = path.dirname(m.filename)
    m.mapping = {}
    m.dependencies.forEach(relativePath => {
      let absolutePath = path.join(dirname, relativePath)
      let childAsset = createAsset(absolutePath) // 这里要用绝对路径，用相对路径的话容易找不到，这个我们在开发的时候应该都有体会过
      m.mapping[relativePath] = childAsset.id
      moduleArr.push(childAsset) // 往 moduleArr 里面继续追加模块，使循环继续
    })
  }

  return moduleArr // 返回所有模块数组
}

function createBundleJs(moduleArr) {
  let moduleStr = ''
  moduleArr.forEach((m, i) => { // 拼接 modules 里面的内容
    moduleStr += `${ m.id }: [${ m.code }, ${ JSON.stringify(m.mapping) } ],`
  })
  let output = `let modules = { ${moduleStr} }
  function handle(id) {
    let [fn, mapping] = modules[id]
    let exports = {}
    function require(path) {
      return handle(mapping[path])
    }
    fn(require, exports)
    return exports
  }
  handle(0)`
  fs.writeFileSync('./bundle.js', output) // 写到当前路径下的 bundle.js 文件
}

let moduleArr = createAssetArr('./src/index.js')
createBundleJs(moduleArr)
