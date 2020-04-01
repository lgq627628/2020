// 偏函数（partial）简版的柯理化，两次调用
function partial(fn, ...outArgs) {
  return function(...innerArgs) {
    fn.call(null, ...outArgs, ...innerArgs)
  }
}



// 柯理化，可多次调用传参，需要知道参数个数，本质是闭包的使用
function $add(a, b, c) {
  return a + b + c
}
function curry(fn, len) {
  let count = len || fn.length // fn.length 是形参的个数
  return function(...args) {
    if (args.length >= count) {
      return fn.call(null, ...args)
    } else {
      return curry(fn.bind(null, ...args), count - args.length)
    }
  }
}
let add = curry($add, 3)
let rs = add(1, 2, 6)
console.log(rs)



