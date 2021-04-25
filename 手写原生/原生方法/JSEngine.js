// https://juejin.cn/post/6844903471280291854
// https://juejin.cn/post/6844903762910248968
// 模拟实现 JS 引擎：深入了解 JS机制 以及 Microtask and Macrotask
class JSEngine {
  constructor() {
    this.jsStack = [];
    this.macroTaskQueue = [];
    this.microTaskQueue = [];
    this.runScript
  }
  addMacroTask(task) {
    this.macroTaskQueue.push(task);
  }
  addMicroTask(task) {
    this.microTaskQueue.push(task);
  }
  addStack(task) {
    this.jsStack.push(task);
  }
  runScriptHandler() {
    let curTask = this.jsStack.shift();
    while(curTask) {
      this.runTask(curTask);
      curTask = this.jsStack.shift();
    }
  }
  runMarcoTask() {

  }
  runMircoTask() {

  }
  runTask(task) {
    new Function(task)();
  }
}
