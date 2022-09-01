/*
    author: leeenx
    @ timer 对象
    @ 提供 7 个API如下：
    @ timer.setTimeout(fun, delay[, id])
    @ timer.clearTimeout(id)
    @ timer.setInterval(fun, delay[, id])
    @ timer.clearInterval(id)
    @ timer.delete(id) 删除对应id的timeout/interval
    @ timer.pause(id) 暂停对应id的timeout/interval
    @ timer.resume(id) 恢复对应id的timeout/interval
    @ timer.clean() 清空所有 timeout & interval
    参考：https://jelly.jd.com/article/6030a10563dc65014d6fb81d
*/

class AnimationFrame {
    auto = (elapsed, timer) => {
        timer.tick(elapsed - timer.stamp);
        timer.stamp = elapsed;
        timer.id = requestAnimationFrame((elapsed) => this.auto(elapsed, timer));
    };
    enable(timer) {
        timer.paused = false;
        timer.stamp = 0;
        timer.id = requestAnimationFrame((elapsed) => this.auto(elapsed, timer));
    }
    disable(timer) {
        cancelAnimationFrame(timer.id);
    }
}

// 原生RAF，就相当于主时间轴
const RAF = new AnimationFrame();

export class Timer {
    // 构造函数
    constructor() {
        // 暂停状态 - 这是个公共状态，由外部 Ticker 决定
        this.paused = true;

        // 队列
        this.queue = new Map();

        // 开启 RAF
        RAF.enable(this);
    }

    // setTimeout 的实现
    setTimeout(fn, delay, id = Symbol('timeoutID')) {
        // 存入队列
        this.queue.set(id, {
            fn,
            type: 0,
            paused: 0,
            elapsed: 0,
            delay,
        });
        return id;
    }

    // clearTimeout
    clearTimeout(...ids) {
        return this.delete(...ids);
    }

    // setInterval 的实现
    setInterval(fn, delay, id = Symbol('intervalID')) {
        // 存入队列
        this.queue.set(id, {
            fn,
            type: 1,
            paused: 0,
            elapsed: 0,
            delay,
        });
        return id;
    }

    // clearInterval
    clearInterval(...ids) {
        return this.delete(...ids);
    }

    // 修改指定id的 delay/fn
    set(id, config = {}) {
        const item = this.queue.get(id) || {};
        for (const key in config) {
            item[key] = config[key];
        }
        return true;
    }

    // 删除 queue 上的成员
    delete(...ids) {
        return ids.every((id) => this.queue.delete(id));
    }

    // 暂停指定id
    pause(id) {
        if (!id) {
            this.pauseAll();
        } else {
            const item = this.queue.get(id);
            if (item) item.paused = 1;
        }
        return true;
    }

    // 恢复指定id
    resume(id) {
        return this.play(id);
    }

    // 播放指定id
    play(id) {
        if (!id) {
            this.playAll();
        } else {
            const item = this.queue.get(id);
            if (item) item.paused = 0;
        }
        return true;
    }

    // 清空timer
    clean() {
        this.queue = new Map();
        return true;
    }

    // 暂停全部 id
    pauseAll() {
        this.queue.forEach((item) => (item.paused = 1));
        return true;
    }

    // 播放全部 id
    playAll() {
        this.queue.forEach((item) => (item.paused = 0));
        return true;
    }

    // 重置 elapsed 为 0
    reset(id) {
        if (!id) {
            this.resetAll();
        } else {
            const item = this.queue.get(id);
            if (item) item.elapsed = 0;
        }
    }

    // 重置所有的 elapsed 为 0
    resetAll() {
        this.queue.forEach((item) => (item.elapsed = 0));
    }

    // tick
    tick(delta) {
        this.paused || this.updateQueue(delta);
    }

    // 更新 map 队列
    updateQueue(delta) {
        this.queue.forEach((item, id) => {
            if (item.paused === 1) return;
            item.elapsed += delta;
            if (item.elapsed >= item.delay) {
                item.fn();
                item.type === 0 ? this.delete(id) : (item.elapsed = 0);
            }
        });
    }
}

// 对外接口
const timer = new Timer();

// 导出timer
export default timer;
