/**
 * 手写 new 函数
 * 1、新建一个 obj 对象
 * 2、this 指向 obj
 * 3、执行函数体
 * 4、返回 obj
 */
function myNew(Fn, ...args) {
  let obj = {}
  obj.__proto__ = Fn.prototype
  // 上面这两步相当于 let obj = Object.create(Fn.prototype)
  let result = Fn.call(obj, ...args) // call的性能大于apply，能用call就用
  if (result !== null && (typeof res === 'object' || typeof res === 'function')) {
    // 如果你在函数里有自己的 return，并且是个对象，则以你的 return 为准，否则返回这个 obj
    return result
  }
  return obj
}

function Person(name, age) {
  this.name = name
  this.age = age
}
Person.prototype.say = function() {
  console.log(`hello, ${this.name}`)
}

let me = myNew(Person, '尤水就下', 18)
console.log(me)
console.log(me.say())
