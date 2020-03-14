const fs = require('fs').promises
const path = require('path')

function *read() {
  let a = yield fs.readFile(path.resolve(__dirname, 'a.txt'), 'utf-8')
  let b = yield fs.readFile(path.resolve(__dirname, `${a.trim()}.txt`), 'utf-8')
  return b.trim()
}

let it = read()
let {value} = it.next()
value.then(data => {
  let {value} = it.next(data)
  value.then(data2 => {
    let {value} = it.next(data2)
    console.log(value)
  })
})


