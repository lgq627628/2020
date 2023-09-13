// async 的返回值是一个 Promise 对象
// await 的右边是一个（不一定是Promise）表达式，写了 await 就有点 then 的意思
// 用了 await 外层函数必须用 async 声明
// await 只能返回成功的结果，失败的话要用 try...catch 捕获
async function a() {
  return 1
}

const result = a()
result.then(res => { // then 拿到的是 return 结果
  console.log(res)
}, err => {
  console.log(err)
})
console.log(result);

function b() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(6)
    }, 2000);
  })
}

async function c() {
  try {
    let result = await b()
    console.log(result)
  } catch (err) {
    throw err
  }
}

c()



// 抽离成公共方法
const awaitWrap = (promise) => {
  return promise
      .then(data => [null, data])
      .catch(err => [err, null])
}
