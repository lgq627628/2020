class XhrHook {
  constructor(beforeHooks = {}, afterHooks = {}) {
    this.XHR = window.XMLHttpRequest;
    this.beforeHooks = beforeHooks;
    this.afterHooks = afterHooks;
    this.init();
  }
  init() {
    let self = this;
    window.XMLHttpRequest = function() {
      this._xhr = new self.XHR();
      self.overwrite(this);
    }
  }
  overwrite(proxyXHR) {
    let xhr = proxyXHR._xhr;
    for(let k in xhr) {
      if (typeof xhr[k] === 'function') { // 重写方法
        this.overwriteMethods();
      } else { // 重写属性
        this.overwriteAttrs();
      }
    }
  }
  overwriteMethods() {

  }
  overwriteAttrs() {

  }
}
