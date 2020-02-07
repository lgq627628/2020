/**
 * Vue3 响应式原理
 * Vue2 的缺点：数据默认会递归 && 数组改变下标和 length 无效 && 对象中不存在的属性不能被拦截
 * proxy 不兼容 IE11
 */

// reactive(proxy) 和 reactive(sameObj) 是不允许的，所以需要判断一下如果代理过了就不处理了
// 需要 hash 表，但是传统的对象属性只能是字符串或 Symbols，所以需要用到新的 es6 api (new WeakMap)，叫做弱引用映射表，其键必须是对象，而值可以是任意的。跟重要的是可以被垃圾回收
let toProxy = new WeakMap() // 源对象，代理后的对象
let toRaw = new WeakMap() // 代理后的对象，源对象
let activeEffectStacks = [] // 里面存的是 effect
let targetMap = new WeakMap() // targetMap 的形式如下
// {
//   target: {
//     msg: [f1, f2],
//     name: [f1]
//   }
// }
// 对象 => key => [f1, f2]
//     => key => [f1]

function isObject(value) {
  return typeof value === 'object' && value !== null
}
function reactive(target) {
  if (!isObject(target)) return target
  let preTarget = toProxy.get(target)
  if (preTarget) return preTarget // 防止 target 多次代理
  if (toRaw.has(target)) return target // 防止 proxy 多次代理
  let baseHandler = {
    get(target, key, receiver) { // receiver 就是 proxy
      console.log('获取')
      track(target, key)
      // Reflect 的所有属性和方法都是静态的（就像Math对象），感觉像是一些常用方法的映射，但是会有返回值，未来应该会替代 Object
      let res = Reflect.get(target, key, receiver) // 等价于 return target[key]
      return isObject(res) ? reactive(res) : res // 这边还是个递归，但是是按需递归
    },
    set(target, key, value, receiver) {
      let hasKey = target.hasOwnProperty(key)
      let oldValue = target[key]
      let res = Reflect.set(target, key, value, receiver) // 该方法会返回一个 bool 值来告知成功与否，target[key] = value 这种写法不知道设置成功了没
      // 假设调用数组的 push 方法时，会调用两次设置，先添加后修改 length
      if (!hasKey) {
        console.log('新增属性')
        trigger(target, key, 'add')
      } else if (oldValue !== value) { // 所以我们要屏蔽掉无意义的设置
        console.log('修改属性')
        trigger(target, key, 'set')
      }
      return res
    },
    deleteProperty(target, key) {
      console.log('删除')
      return Reflect.deleteProperty(target, key)
    }
  }
  let p = new Proxy(target, baseHandler)
  toProxy.set(target, p)
  toRaw.set(p, target)
  return p
}
function effect(fn) { // 响应式核心：修改啥执行啥
  let effect = createReactiveEffect(fn)
  effect()
}
function createReactiveEffect(fn) {
  let effect = function() {
    return run(effect, fn) // 1、让 fn 执行；2、把 effect 存到栈中
  }
  return effect
}
function run(effect, fn) {
  try {
    activeEffectStacks.push(effect)
    fn() // 当第一次函数执行的时候，会调用 get，和 Vue2 一样利用了 js 是单线程的
  } finally {
    activeEffectStacks.pop()
  }
}
function track(target, key) { // 收集键值所对应的函数
  let nowEffect = activeEffectStacks[activeEffectStacks.length - 1] // 或者 activeEffectStacks[0]
  if (nowEffect) { // 有和键值相关的函数才收集关联，下面写法只是验证多而已，不要怕
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, depsMap = new Map)
    }
    let deps = depsMap.get(key)
    if (!deps) {
      depsMap.set(key, deps = new Set)
    }
    if (!deps.has(nowEffect)) {
      deps.add(nowEffect)
    }
  }
}
function trigger(target, key, type) {
  let depsMap = targetMap.get(target)
  if (depsMap) {
    let deps = depsMap.get(key)
    if (deps) {
      deps.forEach(effect => effect())
    }
  }
}

// 测试例子1
// let proxy = reactive({ msg: '哈哈', person: {name: '尤水就下'}})
// reactive(proxy)
// reactive(proxy)
// console.log(proxy)
// proxy.msg
// proxy.msg = '嘻嘻'
// delete proxy.msg
// proxy.person.name = '小强'

// 测试例子2
// let arr = [1,2,3]
// let proxy = reactive(arr)
// proxy.push(4)
// proxy.length = 100

// 测试案例3
let proxy = reactive({msg: '哈哈', name: '尤水就下'})
effect(() => { // 这个会执行两次，一次默认执行，一次修改的时候执行
  console.log(proxy.msg) // 会调用 get
})
proxy.msg = '呵呵'
proxy.msg = '呵呵'
console.log(targetMap)
