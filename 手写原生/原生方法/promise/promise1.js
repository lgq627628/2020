/**
 * Promise 第一版：大体框架并支持同步回调
 */

class MyPromise {
  constructor(fn) {
    this.status = 'pending' // 保存状态
    this.successValue = null // 保存成功的值
    this.failValue = null // 保存失败的值

    let resolve = (successValue) => { // 这个 successValue 是外部调用传进来的值
      this.status = 'success'
      this.successValue = successValue
    }
    let reject = (failValue) => { // 这个 failValue 是外部调用传进来的值
      this.status = 'fail'
      this.failValue = failValue
    }

    fn(resolve, reject)
  }
  then(successFn, failFn) {
    if (this.status === 'success') {
      setTimeout(() => {
        successFn(this.successValue)
      })
    } else if (this.status === 'fail') {
      setTimeout(() => {
        failFn(this.failValue)
      })
    }
  }
}

let p = new MyPromise((resolve, reject) => {
  console.log('1')
  resolve(100)
}).then(res => {
  console.log('2')
  console.log('成功', res)
}, err => {
  console.log('错误', err)
})
console.log('3')
