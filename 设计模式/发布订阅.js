/**
 * 有一个容器
 * 可以传入东西
 * 可以使用东西
 * 常见应用场景：跨页面、跨组件通信
 * 优点：灵活
 * 缺点：使用不当就会造成数据流混乱，导致代码不好维护
 * 发布订阅：Event的就是调度中心，只有一个类，提供发布和订阅功能 解耦，可以认为是观察者模式的升级版
 */
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
      this.events[eventName].forEach(handler => handler(...args)) // 很多时候函数调用需要绑定上下文，就需要使用 call
    }
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
 * /

