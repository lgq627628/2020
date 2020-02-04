class XVue {
  constructor(options) {
    this.$options = options
    this.$el = options.el
    this.$data = options.data || {}

    // 第一步：数据劫持
    this.observeData(this.$data)
    // 第二步：编译
    new Compile(this.$el, this)
    // 第三步：代理数据
    this.proxyData(this.$data)

    options.created && options.created.call(this)
    // Watcher 的测试小代码
    // new Watcher(this, 'msg') // 告诉 watcher 这个 msg 和 this 这个 vm 实例相关
    // this.msg // 手动获取触发 addDep
    // Watcher 多了会耗内存，这是 Vue1 不适合大项目的原因之一，
    // 但是 Vue2 做了一些改进，一个组件一个 watcher，但是不知道是哪个数据变了，所以 Vue2 的版本才加上了虚拟 dom，需要对比按需更新
  }
  observeData(data) {
    if (!data || typeof data !== 'object') return
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
      this.observeData(data[key])
    })
  }
  defineReactive(obj, key, value) {
    // 因为 dep 实例和 key 一一对应
    const dep = new Dep()
    let self = this
    // 1、Object.defineProperty 只能劫持对象的属性，只能重定义属性的读取（get）和设置（set）行为，我们需要对每个对象的每个属性进行递归遍历。2、无法监控到数组下标的变化（其实它本身可以，是 Vue 为了提高性能抛弃了它，并提供了几个数组 hack 方法）
    // 1、Proxy 可以劫持整个对象，并返回一个新对象。2、有13种劫持操作。3、可以重定义更多的行为，比如 in、delete、函数调用等更多行为
    // 为什么 Vue2 不使用 Proxy 呢？因为 Proxy 是 es6 提供的新特性，它最大问题在于浏览器支持度不够，兼容性不好，最主要的是这个属性无法用 polyfill 来兼容
    // 目前 Proxy 并没有有效的兼容方案，未来大概会是3.0和2.0并行，需要支持IE的选择2.0
    Object.defineProperty(obj, key, {
      enumerable: true, // 可枚举
      configurable: false, // 不能再设置
      get() {
        // 将 Dep.target 指向的 watcher 实例加入到 Dep 中
        // Watcher 实例在实例化过程中， 会读取 data 中的某个属性， 从而触发当前 get 方法
        Dep.target && dep.addDep(Dep.target)
        return value;
      },
      set(newValue) { // 这个 set 也可以写成箭头函数 set: (newValue) => {}
        if (value !== newValue) {
          self.observeData(newValue) // 如果重新设置的值是对象，需要重新劫持
          value = newValue
          dep.notify()
        }
      }
    })
  }
  proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: false,
        get() {
          return data[key]
        },
        set(newValue) {
          data[key] = newValue
        }
      })
    })
  }
}

// 每个 dep 实例都会管理若干个 watcher 实例，dep 和 data 中的 key 一一对应，和 wathcher 则是一对多的关系
class Dep {
  constructor() {
    this.deps = []
  }
  addDep(dep) {
    this.deps.push(dep)
  }
  removeDep(dep) {
    let idx = this.deps.findIndex(d => d === dep)
    if (idx > -1) this.deps.splice(idx, 1)
  }
  notify() {
    this.deps.forEach(dep => dep.update())
  }
}

// 还记得 vue 中有个 this.$watch(vm, a, function(){}) 吗？
// 以及 watch() {} 也是下面这个来实现的
class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm
    this.expr = expr
    this.cb = cb
    Dep.target = this // 把当前 watcher 实例指向 Dep.target
    this.getValue(this.vm, this.expr)
    Dep.target = null
  }
  update() {
    // vue 中不会立即更新 dom，而是加入到队列中，也就是异步的批量更新，提高性能
    this.cb(this.getValue(this.vm, this.expr)) // call 可加可不加，虽然没有用到 this
  }
  getValue(vm, expr) {
    expr = expr.split('.')
    return expr.reduce((pre, cur) => {
      return pre[cur]
    }, vm.$data)
  }
}

// 下回这个 watcher 会先保存一下老值，应该是给手动调用 watcher 用的
// class Watcher {
//   constructor(vm, expr, cb) {
//     this.vm = vm
//     this.expr = expr
//     this.cb = cb

//     Dep.target = this // 把当前 watcher 实例指向 Dep.target
//     this.value = this.getValue(this.vm, this.expr)
//     Dep.target = null
//   }
//   update() {
//     let newValue = this.getValue(this.vm, this.expr)
//     if (newValue !== this.value) {
//       this.value = newValue
//       this.cb(newValue)
//     }
//   }
//   getValue(vm, expr) {
//     expr = expr.split('.')
//     return expr.reduce((pre, cur) => {
//       return pre[cur]
//     }, vm.$data)
//   }
// }
