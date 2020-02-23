/**
 * 闭包有两种常见形式，也就是下面这两种有意义的常见场景
 * 作用1（保存）：延长局部变量的生命周期
 * 作用2（保护）：让函数外部可以访问到函数内部的东西
 * 个人感觉闭包叫做背包更好理解，有点像是在作用域链中加了一层中间变量
 * 内存泄漏：占用的内存没有及时释放导致内存不够
 * 内存溢出：运行出错或者运行需要的内存超出了剩余可用内存
 */

// 常见形式1：返回函数
function f1() {
  let num = 0
  return function f2() {
    num++
    console.log(num)
  }
}
let f = f1() // 调用之后才是闭包，不调用是无意义的
f()
f()
f = null // 运行完之后及时回收


function throttle(f, time) {
  let timer = null
  return function() {
    clearTimeout(timer)
    timer = setTimeout(f, time);
  }
}
window.onresize = throttle(function() {
  console.log('111');
}, 200)

// 常见形式2：里面的函数引用外面函数的形参
function logDelay(msg, time) {
  setTimeout(() => {
    console.log(msg) // 有这句话才是闭包
  }, time);
}
logDelay('xxx', 1000)


(function(w) { // 可以减少作用域链的查找
  function f1(){}
  function f2(){}
  w.tools = {
    f1,
    f2
  }
  console.log(w)
})(window)
