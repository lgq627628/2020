/*
 * @Author: 尤水就下
 * @Date: 2021-09-11 16:57:17
 * @LastEditTime: 2021-09-11 16:59:05
 * @LastEditors: Please set LastEditors
 * @Description: 用 requestAnimationFrame 实现 setTimeout 和 setInterval
 * @FilePath: /2020/工具函数/requestAnimationFrame.js
 */

// setInterval实现
function setInterval(callback, interval) {
    let timer
    const now = Date.now
    let startTime = now()
    let endTime = startTime
    const loop = () => {
        timer = window.requestAnimationFrame(loop)
        endTime = now()
        if (endTime - startTime >= interval) {
            startTime = endTime = now()
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
    if (a === 3) window.cancelAnimationFrame(timer)
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