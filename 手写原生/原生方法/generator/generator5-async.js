// async 和 await 就是 geneator + co，就是个语法糖，它用 babel 编译出来就是 geneator
const fs = require('fs')
const path = require('path')

async function read() {
  let content = await fs.readFileSync(path.resolve(__dirname, 'b.txt'), 'utf-8')
  return content
}

read().then(res => {
  console.log(res)
})
