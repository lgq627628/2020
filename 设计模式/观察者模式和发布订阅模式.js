/**
 * 这个库不错：https://github.com/facebookarchive/emitter
 * 有一个容器
 * 可以传入东西
 * 可以使用东西
 * 常见应用场景：跨页面、跨组件通信
 * 优点：灵活，做到了时间上的解耦和对象之间的解耦
 * 缺点：使用不当就会造成数据流混乱，导致代码不好维护
 * 发布订阅：Event的就是调度中心，只有一个类，提供发布和订阅功能 解耦，可以认为是观察者模式的升级版
 * 和观察者模式的区别在于有没有中转
 * 在实际开发中，我们的模块解耦诉求并非总是需要它们完全解耦。如果两个模块之间本身存在关联，且这种关联是稳定的、必要的，那么我们使用观察者模式就足够了。而在模块与模块之间独立性较强、且没有必要单纯为了数据通信而强行为两者制造依赖的情况下，我们往往会倾向于使用发布-订阅模式。
 */

// 问题：：必须要先订阅再发布吗？https://www.51cto.com/article/676020.html
// 我们所了解的发布/订阅模式，都是订阅者必须先订阅一个消息，随后才能接收到发布者发布的消息。如果把顺序反过来，发布者先发布一个消息，而在此之前并没有对象来订阅它，那么这条消息就消失在宇宙中了。建立一个存放离线事件的堆栈，当事件发布的时候，如果此时还没有订阅者来订阅这个事件，我们暂时把发布事件的动作包裹在一个函数里，这些包装函数将被存入堆栈中，等到终于有对象来订阅此事件的时候，我们将遍历堆栈并且依次执行这些包装函数，也就是重新发布里面的事件。当然离线事件的生命周期只有一次，就像QQ的未读消息只会被重 新阅读一次，所以刚才的操作我们只能进行一次。
// 如果系统的发送方在向接收方发送消息之后，需要接收方进行实时响应的话，那么绝大多数情况下，都不要考虑使用发布/订阅的数据处理模式
// 缺点：如果过多的使用发布订阅模式，会增加维护的难度

class Event {
  constructor() {
    this.events = {}
  }
  on(eventName, handler) {
    (this.events[eventName] || (this.events[eventName] = [])).push(handler)
  }
  off(eventName, handler) {
    if (arguments.length === 0) {
      this.events = {}
    } else if (arguments.length === 1) {
      this.events[eventName] && (this.events[eventName] = [])
    } else if (arguments.length === 2) {
      let arr = this.events[eventName]
      if (!arr) return
      for(let i = arr.length - 1; i >= 0; i--) { // 倒序循环防止数组塌陷
        if (arr[i] === handler) arr.splice(i, 1)
      }
    }
  }
  emit(eventName, ...args) {
    if (this.events[eventName]) {
      // 这里需要对 this.handlers[eventName] 做一次浅拷贝，主要目的是为了避免通过 once 安装的监听器在移除的过程中出现顺序问题
      // const handlers = this.handlers[eventName].slice()
      this.events[eventName].forEach(handler => handler(...args)) // 很多时候函数调用需要绑定上下文，就需要使用 call
    }
  }
  // 为事件注册单次监听器
  once(eventName, cb) {
    // 对回调函数进行包装，使其执行完毕自动被移除
    const wrapper = (...args) => {
      cb(...args)
      this.off(eventName, wrapper)
    }
    this.on(eventName, wrapper)
  }
}

let e = new Event();
e.on('a', () => console.log('a'))
e.on('a', () => console.log('aa'))
e.on('b', () => console.log('b'))
e.on('c', () => console.log('c'))
e.emit('a')
e.off('b')
console.log(e)




/**
 * 观察者模式：观察者模式是有两个类 观察目标observer 观察者subject 耦合 一旦观察目标变化 需要观察者做出反应，目标和观察者是耦合在一起的
 */
// 定义发布者类
class Publisher {
  constructor() {
    this.observers = []
    console.log('Publisher created')
  }
  // 增加订阅者
  add(observer) {
    console.log('Publisher.add invoked')
    this.observers.push(observer)
  }
  // 移除订阅者
  remove(observer) {
    console.log('Publisher.remove invoked')
    this.observers.forEach((item, i) => {
      if (item === observer) {
        this.observers.splice(i, 1)
      }
    })
  }
  // 通知所有订阅者
  notify() {
    console.log('Publisher.notify invoked')
    this.observers.forEach((observer) => {
      observer.update(this)
    })
  }
}
// 定义订阅者类
class Observer {
  constructor() {
      console.log('Observer created')
  }
  update() {
      console.log('Observer.update invoked')
  }
}
// 定义一个具体的需求文档（prd）发布类
class PrdPublisher extends Publisher {
  constructor() {
      super()
      // 初始化需求文档
      this.prdState = null
      console.log('PrdPublisher created')
  }
  
  // 该方法用于获取当前的prdState
  getState() {
      console.log('PrdPublisher.getState invoked')
      return this.prdState
  }
  
  // 该方法用于改变prdState的值
  setState(state) {
      console.log('PrdPublisher.setState invoked')
      // prd的值发生改变
      this.prdState = state
      // 需求文档变更，立刻通知所有开发者
      this.notify()
  }
}
class DeveloperObserver extends Observer {
  constructor() {
      super()
      // 需求文档一开始还不存在，prd初始为空对象
      this.prdState = {}
      console.log('DeveloperObserver created')
  }
  
  // 重写一个具体的update方法
  update(publisher) {
      console.log('DeveloperObserver.update invoked')
      // 更新需求文档
      this.prdState = publisher.getState()
      // 调用工作函数
      this.work()
  }
  
  // work方法，一个专门搬砖的方法
  work() {
      // 获取需求文档
      const prd = this.prdState
      // 开始基于需求文档提供的信息搬砖。。。
      console.log('996 begins...')
  }
}



// 应用场景
const EventBus = new Vue()
export default EventBus

import bus from 'EventBus的文件路径'
Vue.prototype.bus = bus

// 这里func指someEvent这个事件的监听函数
this.bus.$on('someEvent', func)
// 这里params指someEvent这个事件被触发时回调函数接收的入参
this.bus.$emit('someEvent', params)