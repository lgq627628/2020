// 不管我们尝试去创建多少次，它都只给你返回第一次所创建的那唯一的一个实例。要做到这一点，就需要构造函数具备判断自己是否已经创建过一个实例的能力。
class SingleDog {
  show() {
      console.log('我是一个单例对象')
  }
  static getInstance() {
      // 判断是否已经new过1个实例
      if (!SingleDog.instance) {
          // 若这个唯一的实例不存在，那么先创建它
          SingleDog.instance = new SingleDog()
      }
      // 如果这个唯一的实例已经存在，则直接返回
      return SingleDog.instance
  }
}
// 也可以写成闭包的形式
SingleDog.getInstance = (function() {
  // 定义自由变量instance，模拟私有变量
  let instance = null
  return function() {
      // 判断自由变量是否为null
      if(!instance) {
          // 如果为null则new出唯一实例
          instance = new SingleDog()
      }
      return instance
  }
})()





// 实际应用：vuex，一个 Vue 实例只能对应一个 Store
// Vuex 使用单一状态树，用一个对象就包含了全部的应用层级状态。至此它便作为一个“唯一数据源 (SSOT)”而存在。这也意味着，每个应用将仅仅包含一个 store 实例。单一状态树让我们能够直接地定位任一特定的状态片段，在调试的过程中也能轻易地取得整个当前应用状态的快照。 ——Vuex官方文档
// 当组件非常多、组件间关系复杂、且嵌套层级很深的时候，这种原始的通信方式会使我们的逻辑变得复杂难以维护。这时最好的做法是将共享的数据抽出来、放在全局，供组件们按照一定的的规则去存取数据，保证状态以一种可预测的方式发生变化。于是便有了 Vuex，这个用来存放共享数据的唯一数据源，就是 Store。
// 安装vuex插件
Vue.use(Vuex)

// 将store注入到Vue实例中
new Vue({
    el: '#app',
    store
})
// 通过调用Vue.use()方法，我们安装了 Vuex 插件。Vuex 插件是一个对象，它在内部实现了一个 install 方法，这个方法会在插件安装时被调用，从而把 Store 注入到Vue实例里去。也就是说每 install 一次，都会尝试给 Vue 实例注入一个 Store。
let Vue // 这个Vue的作用和楼上的instance作用一样
export function install (_Vue) {
  // 判断传入的Vue实例对象是否已经被install过Vuex插件（是否有了唯一的state）
  if (Vue && _Vue === Vue) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      )
    }
    return
  }
  // 若没有，则为这个Vue实例对象install一个唯一的Vuex
  Vue = _Vue
  // 将Vuex的初始化逻辑写进Vue的钩子函数里
  applyMixin(Vue)
}
// 假如 install 里没有单例模式的逻辑，那我们如果在一个应用里不小心多次安装了插件：失去了单例判断能力的 install 方法，会为当前的Vue实例重新注入一个新的 Store，也就是说你中间的那些数据操作全都没了，一切归 0。





// 案例1：实现一个 Storage
// 定义Storage
class Storage {
  static getInstance() {
      // 判断是否已经new过1个实例
      if (!Storage.instance) {
          // 若这个唯一的实例不存在，那么先创建它
          Storage.instance = new Storage()
      }
      // 如果这个唯一的实例已经存在，则直接返回
      return Storage.instance
  }
  getItem (key) {
      return localStorage.getItem(key)
  }
  setItem (key, value) {
      return localStorage.setItem(key, value)
  }
}
// 闭包版本：先实现一个基础的StorageBase类，把getItem和setItem方法放在它的原型链上
function StorageBase () {}
StorageBase.prototype.getItem = function (key){
    return localStorage.getItem(key)
}
StorageBase.prototype.setItem = function (key, value) {
    return localStorage.setItem(key, value)
}

// 以闭包的形式创建一个引用自由变量的构造函数
const Storage = (function(){
    let instance = null
    return function(){
        // 判断自由变量是否为null
        if(!instance) {
            // 如果为null则new出唯一实例
            instance = new StorageBase()
        }
        return instance
    }
})()
// 案例2：实现一个 Modal
// 核心逻辑，这里采用了闭包思路来实现单例模式
const Modal = (function() {
  let modal = null
  return function() {
        if(!modal) {
          modal = document.createElement('div')
          modal.innerHTML = '我是一个全局唯一的Modal'
          modal.id = 'modal'
          modal.style.display = 'none'
          document.body.appendChild(modal)
        }
        return modal
  }
})()





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
