/**
 * 手写 bind 方法
 * 看这个方法之前可以去看当前目录下的 call 方法
 * bind 和 call 类似，但是不执行函数，只是改变 this 指向，并返回一个新函数
 * 通过 bind 方法绑定之后 this 便是永久性的，再用 call、bind 改变是无效的
 */

// 简单版本
Function.prototype.myBind = function(obj, ...args) {
  let self = this
  return function() {
    self.call(obj, ...args)
  }
}

// 复杂版本
Function.prototype.myBind = function (obj, ...args) {
  if (typeof this !== 'function') {
    throw new Error('bind 前面不是一个函数')
  }
  let self = this
  let newFn = function (...args2) { // 因为支持柯里化形式传参我们需要再次获取存储参数
    let isNew = this instanceof newFn // 判断是否是 new 出来的
    let context = isNew ? this : obj // 如果是 new 调用就绑定到 this 上
    self.apply(context, args.concat(args2))
  }
  function F() {} //创建新方法
  F.prototype = self.prototype; //继承原型
  newFn.prototype = new F(); //绑定原型
  // if (self.prototype) { // 复制源函数的 prototype 给 newFn 一些情况下函数没有 prototype，比如箭头函数
  //   newFn.prototype = Object.create(self.prototype);
  // }
  return newFn
}

// 测试代码
function a(m, n) {
  console.log(this.c, m, n)
}
let b = {
  c: 1
}
let fn1 = a.myBind(b)
let fn2 = a.myBind(b, 1)
console.log(fn1(1, 2), fn2())




