/** 发布订阅，事件中心 */
export class Observable {
    public static __eventListeners;
    public observe = Observable.observe;
    public stopObserving = Observable.stopObserving;
    public fire = Observable.fire;
    static observe(eventName: string, handler: Function) {
        if (!this.__eventListeners) {
            this.__eventListeners = {};
        }
        if (!this.__eventListeners[eventName]) {
            this.__eventListeners[eventName] = [];
        }
        this.__eventListeners[eventName].push(handler);
    }

    static stopObserving(eventName: string, handler: Function) {
        if (!this.__eventListeners) {
            this.__eventListeners = {};
        }
        if (this.__eventListeners[eventName]) {
            if (handler) {
                let idx = this.__eventListeners[eventName].indexOf(handler);
                if (idx !== -1) this.__eventListeners[eventName].splice(idx, 1);
            } else {
                this.__eventListeners[eventName].length = 0;
            }
        }
    }

    static fire(eventName: string, options = {}) {
        if (!this.__eventListeners) {
            this.__eventListeners = {};
        }
        var listenersForEvent = this.__eventListeners[eventName];
        if (!listenersForEvent) return;
        for (var i = 0, len = listenersForEvent.length; i < len; i++) {
            // avoiding try/catch for perf. reasons
            listenersForEvent[i](options || {});
        }
    }

    static on = Observable.observe;
    static off = Observable.stopObserving;
    static trigger = Observable.fire;
}
