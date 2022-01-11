// https://developer.mozilla.org/zh-CN/docs/Web/API/EventListener
// 由于需要与以前遗留的内容进行兼容，EventListener 可以接受一个函数，也可以接受带有 handleEvent() 函数属性的对象。
export interface EventListenerObject {
    handleEvent(e: Event): void;
}