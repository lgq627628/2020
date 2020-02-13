/**
 * 面向对象（OOP）
 * 这是一种编程思想，而 js 本身就是基于面向对象来构建的（如它有很多内置类 Number、Promise，还有 Vue、React、JQuer 也是基于面向对象构建出来的）
 * js 是基于原型和原型链机制来处理的，不像其他语言一般是基于拷贝继承的
 * 封装：低耦合高内聚
 * 多态：重写（子类重写父类的方法）和重载（方法名相同，形参个数或类型不一样，服务器端需要这样写减少复杂度降低并发，前端没有这个概念，相对的只有覆盖或者个数不同）
 * 继承：子类继承父类中的属性和方法（目的让子类的实例能够调用父类的属性和方法）
 */

 /**
 * 1、原型继承
 * 让父类的属性和方法在子类实例的原型链上
 * Child.prototype = new Parent()
 * Child.prototype.constrouctor = Child (保证完整性)
 * 基于原型链的方式调用方法
 * 子类可以通过 Child.prototype.__proto__ 强行重写父类上的方法
 * 父类中私有或者公有的属性和方法最终都会变成子类中公有的属性和方法
 */
function A(x) {
  this.x = x
}
A.prototype.getX = function() {
  console.log(this.x)
}

function B(y) {
  this.y = y
}
B.prototype = new A(200)
B.prototype.constrouctor = B
B.prototype.getY = function() {
  console.log(this.y)
}

let b = new B(100)
console.log(b.y, b.getY(), b.x, b.getX())


/**
 * 2、call 继承
 * 只能继承父类私有的属性和方法，把父类私有变成子类私有，因为这只是把 Parent 当普通函数执行
 * Parent.call(Child)
 */
function A(x) {
  this.x = x
}
A.prototype.getX = function() {
  console.log(this.x)
}

function B(y) {
  A.call(this, 200)
  this.y = y
}
B.prototype.getY = function() {
  console.log(this.y)
}

let b = new B(100)
console.log(b.y, b.getY(), b.x)


/**
 * 3、寄生式组合继承
 * call + 类似原型继承
 * 特点：父类的公有和私有分别被子类的公有和私有所继承（公有私有分别继承）
 */
function A(x) {
  this.x = x
}
A.prototype.getX = function() {
  console.log(this.x)
}

function B(y) {
  A.call(this, 200)
  this.y = y
}
B.prototype = Object.create(A.prototype)
B.prototype.constrouctor = B
B.prototype.getY = function() {
  console.log(this.y)
}

let b = new B(100)
console.log(b.y, b.getY(), b.x, b.getX())


/**
 * 4、ES6 版本
 * 只能 new A() 而不能当普通函数执行
 * class Child extends Paretnt + super()，原理就是上面的寄生组合继承
 */
class A {
  constructor(x) {
    this.x = x
  }
  getX() {
    console.log(this.x)
  }
}
// A.prototype.MAX_VALUE = 10 // 如果要添加公有属性

class B extends A {
  constructor(x, y) {
    super(x) // 写了 constructor 第一句话必须写 super()，不写 constructor 也可以，默认会自己加上 constructor 并调用 super()
    this.y = y
  }
  getY() {
    console.log(this.y)
  }
}
// B.prototype = Object.create(A.prototype) 这是错误的，不允许重定向原型
let b = new B(100, 200)
console.log(b.x, b.y, b.getX())
