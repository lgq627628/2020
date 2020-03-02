class AsyncPLugin {
  apply(complier) {
    complier.hooks.emit.tapAsync('AsyncPLugin', (compliation, cb) => {
      setTimeout(() => {
        console.log('这是异步的，请骚等一下')
        cb()
      }, 2000);
    })
    complier.hooks.emit.tapPromise('AsyncPLugin', (compliation, cb) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log('在等2s就好啦')
          resolve()
        }, 2000);
      })
    })
  }
}

module.exports = AsyncPLugin
