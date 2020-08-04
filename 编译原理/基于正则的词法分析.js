const readline = require('readline');
const fs = require('fs');

// let numReg = /[0-9]+/
// let idReg = /[A-Za-z_][0-9A-Za-z_]*/
// let strReg = /['"][^'"]*['"]/
// let opReg = />=|<=|==|===|&&|\|\|/
// let noteReg = /\/\/.*/
// enum TokenType {
//   Number: 2,
//   ID,
//   String,
//   OP,
//   Note
// }
let numReg = `[0-9]+`
let idReg = `[A-Za-z_][0-9A-Za-z_]*`
let strReg = `['][^']+[']`
let opReg = `\\*|\\+|\\-|\\/|=|>=|<=|==|===|&&|\\|\\|`
let noteReg = `\\/\\/.*`
let tokenMapArr = [0,1,'Number', 'ID', 'String', 'OP', 'Note']
// 下面这个匹配是有顺序的
let finalReg = new RegExp(`\s*((${numReg})|(${idReg})|(${strReg})|(${opReg})|(${noteReg}))`)
let rs = []
function readLines(input, func) {
  var remaining = '';
  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      func(line);
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);
    }
  });
}

function func(data) {
  let arr = data.match(finalReg)
  while(arr) {
    console.log('zz', arr)
    let temp = ''
    let token
    for(let i = 2; i < arr.length - 1; i++) {
      temp = arr[i]
      if (temp) {
        data = data.slice(+arr.index+temp.length, data.length)
        arr = data.match(finalReg)
        console.log(data)
        token = new Token(tokenMapArr[i], temp)
        rs.push(token)
        break
      }
    }
  }
  console.log(rs)
}
var input = fs.createReadStream(__dirname + '/test.txt');
readLines(input, func);

class Token {
  constructor(type, text) {
    this.type = type
    this.text = text
  }
}
