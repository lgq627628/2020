// 用 define 声明一个模块，require 来使用
// 《你不知道的js上卷》第54页有说明

let moduleCbMap = {} // 其实就是把 define 中定义的模块当作回调函数存储起来
function define(moduleName, deps, cb) {
  cb.deps = deps
  moduleCbMap[moduleName] = cb // 存储了依赖和回调
}

function require(deps, cb) {
  let returnArr = deps.map(dep => {
    let needDeps = moduleCbMap[dep].deps // [ 'age' ]
    let cb = moduleCbMap[dep]

    let exports
    require(needDeps, function(...args) {
      exports = cb(...args)
    })

    return exports
  })

  cb(...returnArr)
}

define('name',['age'], function(age) {
  return '尤水就下' + age
});

define('age',[], function() {
  return '20'
});

require(['name'], function(name) {
  console.log(name)
})
