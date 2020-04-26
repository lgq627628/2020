let xlsx = require('node-xlsx');
let sheets = xlsx.parse('./enemy.xlsx');//获取到所有sheets

let arr = []
sheets.forEach(function(sheet){
    console.log(sheet['name']);
    let data = sheet['data']
    let keyRow = data[0]
    for(let rowNum in data){
        if (rowNum >= 2) {
          let row = data[rowNum]
          let obj = {}
          row.forEach((r, i) => {
            obj[keyRow[i]] = row[i]
          })
          arr.push(obj)
        }
    }
})

console.log(arr)
