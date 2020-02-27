class Batcher { // 这个是对批量操作的异步处理
  constructor() {
    this.reset()
  }

  reset() {
    this.has = {}
    this.queue = []
    this.waiting = false // 只要在第一次的时候放入微任务中即可
  }

  push(watcher) {
    let id = watcher.id
    if (!this.has[id]) {
      this.queue.push(watcher)
      this.has[id] = true
      if (!this.waiting) { // 放入微任务或者宏任务
        this.waiting = true
        if ('Promise' in window) { // 这个就是小型的 nextTick
          Promise.resolve().then(() => {
            this.flush()
          })
        } else {
          setTimeout(() => {
            this.flush()
          }, 0);
        }
      }
    }
  }

  flush() { // 执行并清空队列
    this.queue.forEach(watcher => {
      watcher.run()
    })
    this.reset()
  }
}
