// 扩展内置对象，以数组为例子
function MyArr() {}
MyArr.prototype = new Array()
MyArr.prototype.say = function() {
  console.log('6666')
}
let arr = new MyArr()
console.log(arr)
