import Tween from "./tween.js"
class Core {
    constructor(opts) {
        this._init(opts)
        this.state = 'init'
    }

    _init(opts) {
        this._initVal(opts.value)
        this.duration = opts.duration || 1000
        this.timingFn = opts.timingFn || 'linear'
        this.renderFn = opts.renderFn || this._defaultFn  // 动画运动的每一帧，都会调用一次该函数，并把计算好的当前状态值以参数形式传入，有了当前状态值，我们就可以自由地选择渲染动画的方式啦

        this.onPlay = opts.onPlay;
        this.onEnd = opts.onEnd;
        this.onStop = opts.onStop;
        this.onReset = opts.onReset;
    }

    _initVal(value) {
        this.values = [];
        value.forEach(v => {
            this.values.push({
                start: parseFloat(v[0]),
                end: parseFloat(v[1]),
            })
        });
    }

    _loop() {
        const deltaT = Date.now() - this.startTime
        const duration = this.duration
        const fn = Tween[this.timingFn]

        if (this.state === 'end' || deltaT >= duration) {
            this._end();
        } else if (this.state === 'stop') {
            this._stop();
        } else if (this.state === 'init') {
            this._reset();
        } else { // 倘若当前时间进度t还未到终点，则根据当前时间进度计算出目标现在的状态值
            this._renderFn(deltaT, duration, fn)
            window.requestAnimationFrame(this._loop.bind(this))
        }
    }

    _renderFn(deltaT, duration, fn) {
        const values = this.values.map(value => fn(deltaT, value.start, value.end - value.start, duration))
        this.renderFn.apply(this, values)
    }

    _play() {
        this.state = 'play'
        this.onPlay && this.onPlay();
        this.startTime = Date.now()
        const loop = this._loop.bind(this)
        window.requestAnimationFrame(loop)
    }

    play() {
        this._play()
    }

    end() { // 直接结束动画
        this.state === 'play' ? this.state = 'end' : this._end()
    }

    _end() {
        this.state = 'end'
        this._renderEndState()
        this.onEnd && this.onEnd()
    }

    _renderEndState() { // 把目标变成结束状态
        const duration = this.duration
        const fn = Tween[this.timingFn]
        this._renderFn(duration, duration, fn)
    }

    reset() { // 直接结束动画
        this.state === 'play' ? this.state = 'init' : this._reset()
    }

    _reset() {
        this.state = 'reset'
        this._renderResetState()
        this.onReset && this.onReset()
    }

    _renderResetState() { // 把目标变成结束状态
        const duration = this.duration
        const fn = Tween[this.timingFn]
        this._renderFn(0, duration, fn)
    }

    stop() {
        if (this.state === 'play') {
            this.state = 'stop'
        } else {
            this.state = 'stop'
            this.onStop && this.onStop()
        }
    }

    _stop(t) {
        this.state = 'stop'
        this._renderStopState(t)
        this.onReset && this.onReset()
    }

    _renderStopState(t) {
        const duration = this.duration
        const fn = Tween[this.timingFn]
        this._renderFn(t, duration, fn)
    }    
}
window.Core = Core
// 假设我们要创建一个动画，让页面上的div同时往右、左分别平移300px、500px，此外还同时把自己放大1.5倍。在这个看似复杂的动画过程中，其实可以拆解成三个独立的动画，每一动画都有自己的起始与终止值：
// - 对于往右平移，就是把css属性的translateX的0px变成了300px
// - 同理，往下平移，就是把tranlateY的0px变成500px
// - 放大1.5倍，也就是把scale从1变成1.5
// 因此传入的value应该长成这样：[[0, 300], [0, 500], [1, 1.5]] 。我们将数组的每一个元素依次保存在实例的value属性中。