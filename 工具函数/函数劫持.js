/**
 * 函数劫持
 * 1、使用一个临时的变量存储函数
 * 2、重新定义原来的函数
 * 3、定义扩展的功能
 * 4、调用临时变量（也就是原来那个函数）
 */

function fn() {
  console.log('原始的功能')
}

// 第一步
let f = fn
// 第二步
fn = function() {
  // 第三步
  console.log('放在前面的新功能')
  // 第四步
  f.apply(this, arguments)
  console.log('放在后面的新功能')
}

fn()


// 举个难度大点的例子：改写 Array.prototype 的七个方法
let ARRAY_METHODS = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice'
]
// 原来的继承关系：arr => Array.prototype => Object.prototype
// 修改之后的继承关系：arr => 改写的方法 => Array.prototype => Object.prototype
arrayMethods = Object.create(Array.prototype)
ARRAY_METHODS.forEach(method => {
  arrayMethods[method] = function() {
    new XVue().observeData()
    return Array.prototype[method].apply(this, arguments)
  }
})

let arr = []
arr.__proto__ = arrayMethods // 当然 __proto__ 是有兼容新问题的，vue 源码中也做了判断，如果不支持，就使用混入法（就是不把 arrayMethods 挂载到原型上，而是直接循环挂载到实例 arr 上）
