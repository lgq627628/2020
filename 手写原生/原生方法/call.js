/**
 * 手写 call 方法
 * call 是 Function 原型对象上的方法，它的作用就是改变 this 指向，然后执行函数
 * call 还可以用来继承 function Son() { Father.call(this) }
 * 和 apply 的区别就是参数的不同，apply 传递的是数组（因为 apply 和 arr 都是 a 开头，方便记忆）
 * bind 和 call 类似，但是不执行函数，只是改变 this 指向，并返回一个新函数
 * 如果传入的第一个参数是 null，则 this 指向不变
 * 可参考文章链接（https://juejin.im/post/5ce4b0c6e51d455d6d535770）
 */

// 简单版本
Function.prototype.easyCall = function (obj = window) {
  obj.fn = this
  obj.fn()
  delete obj.fn
}

// 详细版本
Function.prototype.myCall = function() {
  // 1、让 . 前面的函数执行，当前 this 此时指向 . 前面那个东东
  // 如果第一个参数没传，或者传的是 null、undefined，则不改变当前 this 指向，直接执行函数即可
  let args = [...arguments].slice(1) // Array.prototype.slice.call(arguments, 1) 或者 Array.from(arguments).slice(1)
  let result // 如果原函数有返回值需返回
  if (arguments[0] == undefined) {
    result = this(...args)
    // eval('this(' + args + ')') 实际上是这样执行的，args 是用 for 循环写的
  } else { // 如果传入的是一个数字或者字符串
    let obj = Object(arguments[0])
    // obj.fn = this // 不能直接这样写 obj.this() 因为 obj 下面没有这个方法
    // obj.fn(...args)
    // delete obj.fn // 但是这样写可能会残留一会会，我们最好加在原型链上
    obj.__proto__.fn = this // 万一有个 fn 重名属性就尴尬了， 所以可以这么写 fn = Symbol()
    result = obj.fn(...args)
    delete obj.__proto__.fn
  }
  return result
}

function a() {
  console.log('我是a')
  console.log(this)
}

function b() {
  console.log('我是b')
}

function num(n) {
  console.log(n)
}

let c = {c: 1}
a.myCall()
b.myCall()
a.myCall(b)
a.myCall(c)
num.myCall({}, 5)
