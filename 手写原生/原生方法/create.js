// 手写 Object.create() 方法

// 简单点
function create(obj) {
  let o = {}
  o.__proto__ = obj
  return o
}

// 复杂点
function create(obj) {
  function F() {}
  F.prototype = obj
  return new F()
}
