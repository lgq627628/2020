const fs = require('fs')

module.exports = {
  read(dbPath) {
    return new Promise((resolve, reject) => {
      fs.readFile(dbPath, {flag: 'a+'}, (err, data) => {
        if (err) return reject(err)
        let list = JSON.parse(data.toString() || '[]')
        resolve(list)
      })  // flag 表示以某种方式打开，追加、只读、只写等
    })
  },
  write(dbPath, data) {
    return new Promise((resolve, reject) => {
      let str = JSON.stringify(data)
      fs.writeFile(dbPath, str, err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
}
