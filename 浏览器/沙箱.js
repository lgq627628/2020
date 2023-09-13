// 沙箱隔离

// figma 的沙箱隔离 https://blog.csdn.net/Taobaojishu/article/details/112386442
// 一个尚在 stage2 阶段的草案 Realm API。Realm 旨在创建一个领域对象，用于隔离第三方 JavaScript 作用域的 API。

const whitelist = {
  windiw: undefined,
  document: undefined,
  console: window.console,
};
const scopeProxy = new Proxy(whitelist, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    return undefined;
  },
});
with (scopeProxy) {
  eval("console.log(document.write)"); // Cannot read property 'write' of undefined!
  eval("console.log('hello')"); // hello
}
