/**
 * Promise 第四版：支持 then 穿透
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
      })
    }
    let reject = (failValue) => { // 这个 failValue 是外部调用传进来的值
      if (this.status !== 'pending') return
      this.status = 'fail'
      this.failValue = failValue
      setTimeout(() => {
        this.failCbs.forEach(cb => cb(this.failValue))
      })
    }

    fn(resolve, reject)
  }
  then(successFn, failFn) {
    if (typeof successFn !== 'function') successFn = successVal => successVal
    if (typeof failFn !== 'function') failFn = failValue => { throw failValue } // 注意这个抛错写法，不是 return
    return new MyPromise((resolve2, reject2) => { // 为了区别开名字里加上2
      if (this.status === 'success') {
        setTimeout(() => {
          let returnVal = successFn(this.successValue)
          if (returnVal instanceof MyPromise) {
            returnVal.then(resolve2, reject2)
          } else {
            resolve2(returnVal)
          }
        })
      } else if (this.status === 'fail') {
        setTimeout(() => {
          let returnVal = failFn(this.failValue)
          if (returnVal instanceof MyPromise) {
            returnVal.then(resolve2, reject2)
          } else {
            reject2(returnVal)
          }
        })
      } else if (this.status === 'pending') {
        this.successCbs.push((successVal) => {
          let returnVal = successFn(successVal)
          if (returnVal instanceof MyPromise) {
            returnVal.then(resolve2, reject2)
          } else {
            resolve2(returnVal)
          }
        })
        this.failCbs.push((failValue) => {
          let returnVal = failFn(failValue)
          if (returnVal instanceof MyPromise) {
            returnVal.then(resolve2, reject2)
          } else {
            reject2(returnVal)
          }
        })
      }
    })
  }
}

let p = new MyPromise((resolve, reject) => {
  resolve(100)
}).then()
.then(1)
.then(res => {
  console.log('成功', res)
}, err => {
  console.log('错误', err)
})
