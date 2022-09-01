/*
 * @Author: 尤水就下
 * @Date: 2021-09-11 16:57:17
 * @LastEditTime: 2021-09-11 19:03:22
 * @LastEditors: Please set LastEditors
 * @Description: 用 requestAnimationFrame 实现 setTimeout 和 setInterval
 * @FilePath: /2020/工具函数/requestAnimationFrame.js
 */

// https://juejin.cn/post/6844903761102536718
// https://juejin.cn/post/6844904083204079630#heading-15
// https://zhuanlan.zhihu.com/p/111027537
// https://segmentfault.com/a/1190000017332455

// setInterval实现
function setInterval(callback, interval) {
    let timer
    const now = Date.now
    let startTime = now()
    let endTime = startTime
    const loop = () => {
        timer = window.requestAnimationFrame(loop)
        endTime = now()
        const durTime = endTime - startTime
        if (durTime >= interval) {
            console.log(durTime)
            startTime = endTime = now()
            startTime = startTime + durTime
            callback(timer)
        }
    }
    timer = window.requestAnimationFrame(loop)
    return timer
}

let a = 0
setInterval(timer => {
    console.log(a)
    a++
}, 1000)




// setTimeout 实现
function setTimeout(callback, interval) {
    let timer
    const now = Date.now
    let startTime = now()
    let endTime = startTime
    const loop = () => {
        timer = window.requestAnimationFrame(loop)
        endTime = now()
        if (endTime - startTime >= interval) {
            callback(timer)
            window.cancelAnimationFrame(timer)
        }
    }
    timer = window.requestAnimationFrame(loop)
    return timer
}

let a = 0
setTimeout(timer => {
    console.log(a)
    a++
}, 1000)
// 0



// 1、利用这个api,可以将某些代码放到下一次重新渲染时执行,避免短时间内触发大量reflow。
// 例如页面滚动事件（scroll）的回调函数就很适合使用这个api, 将回调操作推迟到下一次重新渲染。但需要注意的是requestAnimationFrame 不管理回调函数，即在回调被执行前，多次调用带有同一回调函数的 requestAnimationFrame，会导致回调在同一帧中执行多次。最简单的，可以用节流函数来解决这个问题，也可以想办法让requestAnimationFrame的队列里同样的回调函数只有一个:
let scheduledAnimationFrame = false;
document.body.onscroll = () => {
    if (scheduledAnimationFrame) return;
    scheduledAnimationFrame = true;
    window.requestAnimationFrame(() => {
        scheduledAnimationFrame = false;
        // do something
    });
};




// 2、如何渲染几万条数据并不卡住界面
// 也就是说不能一次性将几万条都渲染出来，而应该一次渲染部分 DOM，那么就可以通过 requestAnimationFrame 来每 16 ms 刷新一次。
setTimeout(() => {
    // 插入十万条数据
    const total = 100000
    // 一次插入 20 条，如果觉得性能不好就减少
    const once = 20
    // 渲染数据总共需要几次
    const loopCount = total / once
    let countOfRender = 0
    let ul = document.querySelector("ul");
    function add() {
      // 优化性能，插入不会造成回流
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < once; i++) {
        const li = document.createElement("li");
        li.innerText = Math.floor(Math.random() * total);
        fragment.appendChild(li);
      }
      ul.appendChild(fragment);
      countOfRender += 1;
      loop();
    }
    function loop() {
      if (countOfRender < loopCount) {
        window.requestAnimationFrame(add);
      }
    }
    loop();
  }, 0);



// 第一步：
let time = 0;
function A(t) {
    requestAnimationFrame(A)
    console.log("距离上一次执行的时间间隔", t - time)
    time = t
}
A()
// 第二步：
let interval = 1000
let lastTime = 0
function SecondTimer(t) {
    requestAnimationFrame(SecondTimer)
    if(t - lastTime >= interval) {
        console.log("1s到了")
        lastTime = t
    }
}
SecondTimer()
// 第三步：
class Timer {
    constructor(fn, interval) {
        this.interval = interval
        this.fn = fn
        this.lastTime = 0

        this.loop(0)
    }
    loop(timestamp){
        this.timer = requestAnimationFrame(Timer.prototype.loop.bind(this))
        if(timestamp - this.lastTime > this.interval) { 
            this.lastTime = timestamp;
            typeof this.fn == "function" && this.fn()
        }
    }
    clear() {
        cancelAnimationFrame(this.timer)
        this.timer = null
    }
}
// 调用
let t = new Timer(() => {
    console.log("timer 1s到了")
}, 1000)
let t2 = setInterval(() => {
    console.log("setinterval 1s到了")
}, 1000)
