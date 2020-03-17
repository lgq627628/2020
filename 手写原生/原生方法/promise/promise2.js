/**
 * Promise 第二版：支持 Promise 里面放异步，以及限制状态只能改变一次
 */

class MyPromise {
  constructor(fn) {
    this.status = 'pending' // 保存状态
    this.successValue = null // 保存成功的值
    this.failValue = null // 保存失败的值

    this.successCbs = []
    this.failCbs = []
    let resolve = (successValue) => { // 这个 successValue 是外部调用传进来的值
      if (this.status !== 'pending') return
      this.status = 'success'
      this.successValue = successValue
      setTimeout(() => {
        this.successCbs.forEach(cb => cb(this.successValue))
      });
    }
    let reject = (failValue) => { // 这个 failValue 是外部调用传进来的值
      if (this.status !== 'pending') return
      this.status = 'fail'
      this.failValue = failValue
      setTimeout(() => {
        this.failCbs.forEach(cb => cb(this.failValue))
      });
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
    } else if (this.status === 'pending') { // 由于前面主体内容是异步的，执行到这里的时候状态还未改变，所以先放入回调中
      this.successCbs.push(successFn)
      this.failCbs.push(failFn)
    }
  }
}

let p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(100)
  }, 2000);
}).then(res => {
  console.log('成功', res)
}, err => {
  console.log('错误', err)
})
