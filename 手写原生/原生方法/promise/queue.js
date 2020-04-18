class Queue {
  constructor() {
    this.cbs = []
    this.limitNum = 1
    this.loop = 0
    this.rs = null
  }

  task(delay, cb) {
    this.cbs.push({delay, cb})
    return this
  }

  run() {
    let task = this.cbs.slice(this.loop * this.limitNum, this.loop * this.limitNum + this.limitNum)[0]
    if (!task) {
      this.loop = 0
      return Promise.resolve(this.rs)
    }
    new Promise(resolve => {
      setTimeout(() => {
        task.cb()
        this.loop++
        resolve()
      }, task.delay)
    }).then(res => {
      this.rs = res
      this.run()
    })
  }

  start() {
    this.run()
  }
}

new Queue()
  .task(1000, () => {
    console.log(1)
  })
  .task(2000, () => {
    console.log(2)
  })
  .task(1000, () => {
    console.log(3)
  })
  .start()
