const { resolve } = require("../../ms");
// 那么实际应用中，一个方法满足这几个条件，可以被promisify化
// 该方法必须包含回调函数
// 回调函数必须执行
// 回到函数第一个参数代表err信息，第二个参数代表成功返回的结果

// 有那么一些场景，是不可以直接使用promisify来进行转换的，有大概这么两种状况：编程
// 没有遵循Error first callback约定的回调函数
// 返回多个参数的回调函数
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })
  }
}

