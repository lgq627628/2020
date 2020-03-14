const fs = require('fs').promises
const path = require('path')

function *read() {
  let a = yield fs.readFile(path.resolve(__dirname, 'a.txt'), 'utf-8')
  let b = yield fs.readFile(path.resolve(__dirname, a.trim()), 'utf-8')
  return b.trim()
}


function co(it) {
  return new Promise((resolve, reject) => {
    function next(lastVal) {
      let {value, done} = it.next(lastVal)
      if (done) {
        resolve(value)
      } else {
        Promise.resolve(value).then(res => {
          next(res)
        }, err => {
          reject(err)
        })
      }
    }
    next()
  })
}

co(read()).then(data => {
  console.log(data)
})

// 这里的视频讲解的不错 => https://www.bilibili.com/video/av78638055?from=search&seid=778602150062622230
