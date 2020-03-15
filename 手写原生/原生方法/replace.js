// 字符串替换的本质是取得索引，然后三段式拼接（索引前的部分 + 匹配值 + 索引加上匹配长度后的部分）

let str = '{0}年{1}月{2}日'
let arr = ['2019', '3', '3']

// let res = str.replace(/\{(\d)\}/g, (...args) => {
//   return arr[args[1]]
// })
// console.log(res)
// let reg = /\{(\d)\}/g
// let a = reg.exec(str) // exec 捕获不到返回的是 null，否则都是返回数组
// console.log(a)
// a = reg.exec(str)
// console.log(a)


String.prototype.replace = function(reg, cb) {
  function handle(str, val, newVal) {
    let i = str.indexOf(val)
    let newStr = str.substring(0, i) + newVal + str.substring(i + val.length)
    return newStr
  }
  if (typeof cb !== 'function') cb = () => {}
  let isGlobal = reg.global
  let newStr = this.substring(0)

  let arr = reg.exec(this)
  while(arr) {
    let big = arr[0]
    let index = arr.index
    let val = cb(...arr)
    newStr = handle(newStr, big, val)
    if (!isGlobal) break
    arr = reg.exec(this)
  }
  return newStr
}

let res = str.replace(/\{(\d)\}/g, (...args) => {
  return arr[args[1]]
})
console.log(res)
