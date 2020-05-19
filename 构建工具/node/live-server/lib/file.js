const fs = require('fs')
const path = require('path')

function readFile(fielPath, fileList = []) {
  let dir = fs.readdirSync(fielPath)
  dir.forEach(d => {
    // 不建议在调用 fs.open()、 fs.readFile() 或 fs.writeFile() 之前使用 fs.exists() 检查文件是否存在。 这样做会引入竞态条件，因为其他进程可能会在两次调用之间更改文件的状态。 相反，应该直接打开、读取或写入文件，如果文件不存在则处理引发的错误。
    let p = path.join(fielPath, d)
    let states = fs.statSync(p) // 获取文件信息
    if (/node_modules|\.DS_Store/.test(d)) return
    if (states.isDirectory()) { // 如果是个文件夹
      readFile(p, fileList)
    } else {
      fileList.push({
        name: d,
        type: getType(d),
        size: states.size
      })
    }
  })
}

function getType(fileName) {
  let idx = fileName.lastIndexOf('.')
  return idx >= 0 ? fileName.slice(idx+1) : ''
}


function geFileList(filePath) {
  let rs = []
  readFile(filePath, rs)
  return rs
}

function countFileByType(fielList = []) {
  let fileMap = {}
  fielList.forEach(file => {
    if (!fileMap[file.type]) fileMap[file.type] = []
    fileMap[file.type].push(file)
  })
  return fileMap
}

module.exports = {
  geFileList,
  getType
}
