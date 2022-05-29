/**
 * 发布订阅，事件中心
 * 应用场景：可以在渲染前后、初始化物体前后、物体状态改变时触发一系列事件
 */
export class EventCenter {
    private __eventListeners;
    on(eventName, handler) {
        if (!this.__eventListeners) {
            this.__eventListeners = {};
        }

        if (!this.__eventListeners[eventName]) {
            this.__eventListeners[eventName] = [];
        }
        this.__eventListeners[eventName].push(handler);
        return this;
    }
    off(eventName, handler) {
        if (!this.__eventListeners) {
            return this;
        }

        if (arguments.length === 0) {
            // 如果没有参数，就是解绑所有事件
            for (eventName in this.__eventListeners) {
                this._removeEventListener.call(this, eventName);
            }
        } else {
            // 解绑单个事件
            this._removeEventListener.call(this, eventName, handler);
        }
        return this;
    }
    emit(eventName, options = {}) {
        if (!this.__eventListeners) {
            return this;
        }

        let listenersForEvent = this.__eventListeners[eventName];
        if (!listenersForEvent) {
            return this;
        }

        for (let i = 0, len = listenersForEvent.length; i < len; i++) {
            listenersForEvent[i] && listenersForEvent[i].call(this, options);
        }
        this.__eventListeners[eventName] = listenersForEvent.filter((value) => value !== false);
        return this;
    }
    _removeEventListener(eventName, handler) {
        if (!this.__eventListeners[eventName]) {
            return;
        }
        let eventListener = this.__eventListeners[eventName];
        // 注意：这里我们删除监听一般都是置为 null 或者 false
        // 当然也可以用 splice 删除，不过 splice 会改变数组长度，这点要尤为注意
        if (handler) {
            eventListener[eventListener.indexOf(handler)] = false;
        } else {
            eventListener.fill(false);
        }
    }
}
