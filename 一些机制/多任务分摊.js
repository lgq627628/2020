// 参考：https://jelly.jd.com/article/5fbe54857482df01463e2729
const queue = [];

function _queueNext() {
    const fn = queue.shift();
    fn.call();
    if (queue.length > 0) {
        requestIdleCallback(_queueNext);
    }
}

function process(fn) {
    queue.push(fn);
    // 前面有在排队就跟队，没人就直接进
    if (queue.length === 1) {
        console.log('队列中只有新传入的操作，直接执行');
        requestIdleCallback(_queueNext);
    }
}

window.addEventListener('beforeunload', () => {
    queue.forEach((fn) => {
        fn.call();
    });
});



// ts 版本
class TaskSlice {
    public queue: Function[] = [];
    constructor() {
        this.queue = [];
        this.addEvent();
        this.runAllTask();
    }
    addTask(task: Function) {
        this.queue.push(task);
        if (this.queue.length === 1) {
            requestIdleCallback(this.runTask);
        }
    }
    runTask() {
        const firstTask = this.queue.shift();
        firstTask && firstTask();

        if (this.queue.length) {
            requestIdleCallback(this.runTask);
        }
    }
    runAllTask() {
        this.queue.forEach((q) => {
            q && q();
        });
    }
    addEvent() {
        window.addEventListener('beforeunload', () => {
            this.runAllTask();
        })
    }
}
