// 判断是否为整数
function isInteger(num) {
  return typeof num === 'number' && num % 1 === 0
}

function isNegZero(num) {
  num = Number(num)
  return num === 0 && (1 / num === -Infinity)
}

function _2to10(val, num) { // 进制转换，字符串转数字
  return parseInt(val, num);
  // parseInt('123', 5) // 将'123'看作5进制数，返回十进制数38 => 1*5^2 + 2*5^1 + 3*5^0 = 38
}

function _10to2(val, num) { // 进制转换，数字转字符串
  return val.toString(num);
}


function binary(num) {
  let rs = [];
  let rest = 0;
  while (num) {
    rest = num % 2;
    num = parseInt(num / 2);
    rs.push(rest);
  }
  return rs.reverse().join('');
}
