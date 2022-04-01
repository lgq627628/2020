// https://github.com/JS-Hao/frameani

class Animate {
    constructor(opts) {
        this.object = opts.object;
        this.startValue = opts.startValue;
        this.endValue = opts.endValue;
        this.duration = opts.duration || 1000;
        this.timingFn = opts.timingFn || 'linear';
        this.timeWrap = opts.timeWrap || (() => {}); // 时间扭曲函数
        this.startTime = '';
        this.delay = '';
        this.action = '';
        this.tween = 'linear';
        this.timer = null;
    }
    to(target = {}, duration) {

    }
    delay() {
        return this;
    }
    duration() {
        return this;
    }
    then() {

    }
    stop() {

    }
    finish() {

    }
    run(t) {
        let range = this.endValue - this.startValue;
        this.object[this.property] = this.startValue + (range * time) / this.duration;
    }
    start() {

    }
}


// 一般这种用来作为动画中的一帧的 setTimeout，都会命名为 tick。因为 tick 在英文中，就是我们时钟秒针走了一秒时发出来的声音，后面也用这个声音作为一个单词，来表达走了一帧/一秒。
// 我们的使用方式就是定义一个 tick 函数，让它执行一个逻辑/事件。
// let tick = () => {
// 	let handler = requestAnimationFrame(tick);
//     cancelAnimationFrame(handler);
// }
class Timeline {
    constructor(opts) {
        // this.rate = opts.rate || 1
    }
    tick(t) {
        console.log(t);
        requestAnimationFrame(this.tick.bind(this))
    }
    start() {
        this.tick();
    }
    stop() {

    }
    pause() {

    }
    resume() {

    }
    setRate() {

    }
}