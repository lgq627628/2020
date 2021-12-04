const ALL_GAME_OBJECT_LIST = [];

// 一秒可以算 10 的 8 次方
export class BaseObject {
    constructor() {
        ALL_GAME_OBJECT_LIST.push(this);
        this.hasInit = false;
        this.timeDelta = 0; // 当前帧距离上一帧的时间间隔，因为不同屏幕 requestAnimationFrame 帧率不一样，所以我们最好以时间维度为准
    }
    start() {
    }
    update() { // 更新数据的逻辑在这里

    }
    render() { // 这里负责渲染

    }
    beforeDestory() {

    }
    destory() {
        this.beforeDestory();
        const idx = ALL_GAME_OBJECT_LIST.findIndex(obj => obj === this);
        if (idx >= 0) ALL_GAME_OBJECT_LIST.splice(idx, 1);
    }
}

let lastTimestamp
function loop(timestamp) {
    ALL_GAME_OBJECT_LIST.forEach(obj => {
        if (obj.hasInit) {
            obj.timeDelta = timestamp - lastTimestamp;
            obj.update();
        } else {
            obj.start();
            obj.hasInit = true;
        }
    });
    lastTimestamp = timestamp;
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
window.ALL_GAME_OBJECT_LIST = ALL_GAME_OBJECT_LIST;
