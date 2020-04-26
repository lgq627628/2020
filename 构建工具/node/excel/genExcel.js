// 导出 excel 文件，生成 excel 文件
// 一般来说，前端生成excel而不是csv最主要目的都是为了解决csv不能实现单元格合并的问题，要不然直接导出csv文件就好了，何必引入几百kb的插件。
const xlsx = require('xlsx')
let arrayData = [
  ['name', 'age'],
  ['zhangsan', 20],
  ['lisi', 21],
  ['wangwu', 22],
  ['zhaoliu', 23],
  ['sunqi', 24],
]

let jsonData = [{
  name: "zhangsan1",
  age: 30
}, {
  name: "lisi1",
  age: 31
}, {
  name: "wangwu1",
  age: 32
}, {
  name: "zhaoliu1",
  age: 33
}, {
  name: "sunqi1",
  age: 34
}]

// 将数据转成workSheet
let arrayWorkSheet = xlsx.utils.aoa_to_sheet(arrayData)
let jsonWorkSheet = xlsx.utils.json_to_sheet(jsonData)
// console.log(arrayWorkSheet)
// console.log(jsonWorkSheet)

// 构造 workBook, 这是整个文档对象，一份 Excel 文档中可以包含很多张表，而每张表对应的就是 worksheet 对象。
let workBook = {
  SheetNames: ['arrayWorkSheet', 'jsonWorkSheet'],
  Sheets: {
    'arrayWorkSheet': arrayWorkSheet,
    'jsonWorkSheet': jsonWorkSheet,
  }
}

// 将workBook写入文件
xlsx.writeFile(workBook, "./test.xlsx")


// var data = [{
//   name: 'sheet1',
//   data: [
//       [
//           'ID',
//           'Name',
//           'Score'
//       ],
//       [
//           '1',
//           'Michael',
//           '99'

//       ],
//       [
//           '2',
//           'Jordan',
//           '98'
//       ]
//   ]
// },
// {
//   name: 'sheet2',
//   data: [
//       [
//           'AA',
//           'BB'
//       ],
//       [
//           '23',
//           '24'
//       ]
//   ]
// }
// ]
// var buffer = xlsx.build(data);

// // 写入文件
// fs.writeFile('a.xlsx', buffer, function(err) {
// if (err) {
//   console.log("Write failed: " + err);
//   return;
// }

// console.log("Write completed.");
// });
