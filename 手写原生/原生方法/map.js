/**
 * map 可遍历数组、类数组的每一项
 * @param {Array} arr - 可遍历的数组、类数组或对象
 * @param {Function} cb - 每次遍历需执行的函数；并且会把每一项的内容和索引传递给该函数；还要接收该函数的返回结果
 * @return {Array} - 返回一个新的数组
 */
function map(arr, cb) {
  if (typeof cb !== 'function') cb = () => {} // cb = Function.prototype
  let newArr = [...arr] // 如果是对象，对应的就是 let newObj = { ...obj }
  for(let i = 0; i < arr.length; i++) { // 如果是对象，对应的就是 for (let key in newObj)，当然还要用 hasOwnProperty 判断
    let result = cb(arr[i], i)
    if (typeof result !== 'undefined') newArr[i] = result
  }
  return newArr
}

let arr = [1, 2, 3, 4]
let arr2 = map(arr, (item, i) => item * 2)
console.log(arr, arr2)
