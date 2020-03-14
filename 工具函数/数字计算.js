// 可以用这个轻量库 https://github.com/nefe/number-precision
// npm install number-precision --save
// 完善点的库有：Math.js 和 bignumber.js

function strip(num, precision = 12) { // 用于数据展示
  return +parseFloat(num.toPrecision(precision));
}

/**
 * 用于数字计算：转成整数计算
 */
function add(num1, num2) {
  const num1Digits = (num1.toString().split('.')[1] || '').length;
  const num2Digits = (num2.toString().split('.')[1] || '').length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
}
