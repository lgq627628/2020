/**
 * 错误的几种类型
 * 1、Error：所有错误的父类
 * 2、ReferenceError：引用的变量不存在
 * 3、TypeError：数据类型不正确
 * 4、RangeError：数值不在允许的范围内
 * 5、SyntaxError：语法错误
 *
 * 处理方式
 * 捕获错误：try{...}catch(e){} 这个 e 是个对象
 * 抛出错误：throw new Error('xxxxx')
 *
 * 本身属性
 * message
 * stack
 */

// ReferenceError
console.log(a);

// TypeError
let b = null
b.xxx()
console.log(b.a)

// RangeError
function fn() {
  fn()
}
fn()

// SyntaxError
let c = ''''
