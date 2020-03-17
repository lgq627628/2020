/**
 * Promise 第七版：抽离 then 里面的公共部分并加上少许异常捕获
 */

class MyPromise {
  constructor(fn) {
    this.status = 'pending' // 保存状态
    this.successValue = null // 保存成功的值
    this.failValue = null // 保存失败的值

    this.successCbs = []
    this.failCbs = []
    let resolve = (successValue) => { // 这个 successValue 是外部调用传进来的值
      // if (successValue instanceof MyPromise) { 这个和 MyPromise.resolve 里面的处理方式是一个意思，其实应该写在这边比较好
      //   successVal.then(resolve, reject)
      // }
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

    try {
      fn(resolve, reject) // 你传进来的函数里面可能有错误
    } catch (err) {
      reject(err)
    }
  }
  then(successFn, failFn) {
    if (typeof successFn !== 'function') successFn = successVal => successVal
    if (typeof failFn !== 'function') failFn = failValue => { throw failValue }

    let p2HasCalled = false // p2 是否已经执行过
    function handleProm(p2, returnVal, resolve2, reject2) { // 这个方法应该写在外面的，这里便于阅读就放这里了
      if (p === returnVal) reject2(new Error('promise 重复调用啦，会死循环的'))
      try {
        if (returnVal instanceof MyPromise) { // 如果返回的是 MyPromise，则得等到这个 MyPromise 执行完再 resolve
          returnVal.then(res => {
            handleProm(p2, res, resolve2, reject2) // 这边是个递归，最终如果不是 MyPromise 类型就会 resolve
          }, reject2)
        } else {
          if (p2HasCalled) return
          p2HasCalled = true
          resolve2(returnVal) // 返回值是个普通值，就直接向下传递
        }
      } catch (err) {
        if (p2HasCalled) return
        p2HasCalled = true
        reject2(err)
      }
    }

    let p2 = new MyPromise((resolve2, reject2) => { // 为了区别开名字里加上2
      if (this.status === 'success') {
        setTimeout(() => {
          try {
            let returnVal = successFn(this.successValue)
            handleProm(p2, returnVal, resolve2, reject2)
          } catch (err) {
            reject2(err)
          }
        })
      } else if (this.status === 'fail') {
        setTimeout(() => {
          let returnVal = failFn(this.failValue)
          handleProm(p2, returnVal, resolve2, reject2)
        })
      } else if (this.status === 'pending') {
        this.successCbs.push((successVal) => {
          try {
            let returnVal = successFn(successVal)
            handleProm(p2, returnVal, resolve2, reject2)
          } catch (err) {
            reject2(err)
          }
        })
        this.failCbs.push((failValue) => {
          try {
            let returnVal = failFn(failValue)
            handleProm(p2, returnVal, resolve2, reject2)
          } catch (err) {
            reject2(err)
          }
        })
      }
    })
    return p2
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

let p = new MyPromise((resolve, reject) => {
  resolve(100)
}).then(res => {
  console.log('成功', res)
  // return 0
  return new MyPromise((resolve2, reject2) => {
    setTimeout(() => {
      resolve2(0)
    }, 1000)
  })
}, err => {
  console.log('错误', err)
}).then(res2 => {
  console.log('成功2', res2)
}, err2 => {
  console.log('错误2', err2)
})
