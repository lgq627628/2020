/**
 * 有一个容器
 * 可以传入东西
 * 可以使用东西
 * 常见应用场景：跨页面、跨组件通信
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
