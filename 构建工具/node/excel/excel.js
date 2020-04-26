// 参考链接 http://www.imooc.com/article/42077


// 读取 excel 文件
const XLSX = require('xlsx')
const fs = require('fs')

let buf = fs.readFileSync("./enemy.xlsx");
let wb = XLSX.read(buf, {type:'buffer'});
// console.log(wb.SheetNames, wb.Sheets)

let idx = wb.SheetNames.findIndex(name => name === 'enemy')
if (idx < 0) {
  console.log('暂无对应的 enemy 表文件内容')
  return
}
let ws = wb.Sheets['enemy']

// defval: 如果值为空还是要显示 key 的
let rs = XLSX.utils.sheet_to_json(ws, {header: '2', defval: ''})
console.log(rs)
