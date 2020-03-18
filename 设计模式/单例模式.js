// ## 来源1
// 普通单例模式
// 1、表现形式：let obj = { xxx: 'xxx' }，该模式下的 obj 不仅仅是个对象名，又被称为命名空间【nameSpace】，多个命名空间是独立分开的，不冲突
// 2、作用：把描述同一事物的属性和特征进行分组分类（也就是存储在同一个堆内存中），避免了全局变量的冲突和污染
// 3、名字由来：每一个命名空间都是 js 中 Object 这个内置基类的实例，而实例之间是相互独立互不干扰的
let obj = { xxx: 'xxx' }


// 高级单例模式
// 1、在给命名空间赋值的时候，不是直接赋值一个对象，而是先执行一个匿名函数，形成一个私有作用域 A（不销毁的栈内存），在 A 中创建一个堆内存，把堆内存地址赋值给命名空间
// 2、我们可以在 A 中创造很多内容，最后只暴露需要供外面使用的即可
let nameSpace = (function() {
  let a = 10
  function fn(){}

  return {
    a,
    fn
  }
})()





// ## 来源2
// 方式一：全局变量
let instance = null
function Tool() {
  if (instance) return instance
  instance = this
  this.a = 'xxx'
  this.b = function() {}
}


// 方式二：静态属性
function Tool() {
  if (Tool.instance) return Tool.instance
  Tool.instance = this
  this.a = 'xxx'
  this.b = function() {}
}


// 方式三：上面两种方式外部都可以修改 instance 实例，不安全，我们用即时函数将其优化一下
(function(w) {
  let instance = null
  function Tool() {
    if (instance) return instance
    instance = this
    this.a = 'xxx'
    this.b = function() {}
  }
  w.Tool = Tool
})(window)


// 方式四：闭包-惰性函数（其实就是函数重新赋值）
function Tool() {
  let instance = this
  this.a = 'xxx'
  this.b = 'hhh'
  Tool = function() { // 该方法有个问题就是调用一次之后如果修改原型是不生效的
    return instance
  }
}

function Tool() {
  let instance = this
  let oldPrototype = Tool.prototype
  this.a = 'xxx'
  this.b = 'hhh'
  Tool = function() {
    return instance
  }
  Tool.prototype = oldPrototype
  instance = new Tool()
  instance.constructor = Tool
  return instance
}



// 实际应用：弹窗
function createSingle(fn) {
  let instance
  return function() {
    return instance || (instance = fn.apply(this, arguments))
  }
}


let Alert = (function() {
  let instance
  function Alert(text) {
    if (!instance) instance = this instanceof Alert ? this : new Alert(text) // 这是用来判断是否有用 new 关键字，没有 new 的话 this 一般是 window
    instance.init(text)
    return instance
  }
  Alert.prototype.init = function(text) {
    this.text = text
  }
  return Alert
})()

let a = Alert('xx')
let b = new Alert('hh')
console.log(a===b, a)




// 真正的弹窗例子
let Alert = (function() {
  let instance
  let div
  function createDiv() {
    if (!div) {
      div = document.createElement('div')
      div.style.display = 'none'
      document.body.append(div)
    }
  }
  function Alert(text) {
    if (!instance) instance = this instanceof Alert ? this : new Alert(text) // 这是用来判断是否有用 new 关键字，没有 new 的话 this 一般是 window
    instance.init(text)
    return instance
  }
  Alert.prototype.init = function(text) {
    createDiv() // 惰性单体，就是延迟执行
    div.innerHTML = text
    div.style.display = 'block'
  }
  Alert.prototype.hide = function() {
    div.style.display = 'none'
  }
  return Alert
})()

// 真正的弹窗例子进阶改版
function createDiv() {
  let div = document.createElement('div')
  div.style.display = 'none'
  document.body.append(div)
  return div
}
let Single = (function() {
  let instance
  return function(fn) {
    return instance || (instance = fn.apply(this, arguments))
  }
})()
let Alert = (function() {
  let instance
  let div
  function Alert(text) {
    if (!instance) instance = this instanceof Alert ? this : new Alert(text) // 这是用来判断是否有用 new 关键字，没有 new 的话 this 一般是 window
    instance.init(text)
    return instance
  }
  Alert.prototype.init = function(text) {
    div = Single(createDiv) // 动态惰性单体
    div.innerHTML = text
    div.style.display = 'block'
  }
  Alert.prototype.hide = function() {
    div.style.display = 'none'
  }
  return Alert
})()
