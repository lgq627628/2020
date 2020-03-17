/**
 * Promise 第六版：支持 Promise.all、Promise.race
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
    if (typeof failFn !== 'function') failFn = failValue => { throw failValue }
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
  catch(failFn) {
    return this.then(null, failFn)
  }
  finally(fn) { // finally 的特点：总会执行，并且也是返回 Promise，但向下会传递的是上一次的值而不是 finally 中的值
    return this.then(res => {
      return MyPromise.resolve(fn()).then(() => res)
    }, err => {
      return MyPromise.resolve(fn()).then(null, () => { throw err })
    })
  }
}
MyPromise.resolve = function(value) {
  return new MyPromise((resolve, reject) => {
    if (value instanceof MyPromise) {
      value.then(resolve, reject)
    } else {
      resolve(value)
    }
  })
}
MyPromise.reject = function(value) {
  return new MyPromise((resolve, reject) => {
    reject(value)
  }).then(null, value)
}
MyPromise.all = function(promises) { // 接受一个数组，只有都成功才算成功，一个错就异常
  return new MyPromise((resolve, reject) => {
    let arr = [] // 接受每个 promise 的返回值，和 promises 一一对应，顺序一致
    let count = 0
    promises.forEach((p, i) => {
      if (p instanceof Promise) {
        p.then(res => {
          arr[i] = res
          count++
          if (count >= promises.length) resolve(arr)
        }, err => {
          reject(err)
        })
      } else {
        arr[i] = p
        count++
        if (count >= promises.length) resolve(arr)
      }
    })
  })
}
MyPromise.race = function(promises) { // 接受一个数组，最先返回成功就成功，最先失败就失败
  return new MyPromise((resolve, reject) => {
    promises.forEach((p, i) => {
      if (p instanceof Promise) {
        p.then(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
      } else {
        resolve(p)
      }
    })
  })
}

MyPromise.all([new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000);
}), 2, 3]).then(res => {
  console.log(res)
})

MyPromise.race([new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(0)
  }, 2000);
}), 2, 3]).then(res => {
  console.log(res)
})
