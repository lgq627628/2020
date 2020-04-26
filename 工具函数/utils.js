// 判断是否为整数
function isInteger(num) {
  return typeof num === 'number' && num % 1 === 0
}

function isNegZero(num) {
  num = Number(num)
  return num === 0 && (1 / num === -Infinity)
}
