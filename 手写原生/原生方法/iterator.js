Object.prototype[Symbol.iterator] = function() {
  let i = 0;
  let keys = Object.keys(this);
  let self = this;
  return {
    next() {
      if (i < keys.length) {
        return { value: self[keys[i++]], done: false }
      } else {
        return { value: undefined, done: true }
      }
    }
  }
}

 /*
    这是一个手写的迭代器(Iterator)
    满足迭代器协议的对象。
    迭代器协议: 对象的next方法是一个无参函数，它返回一个对象，该对象拥有done和value两个属性：
*/
var it = makeIterator(["a", "b"]);

it.next(); // { value: "a", done: false }
it.next(); // { value: "b", done: false }
it.next(); // { value: undefined, done: true }

function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function() {
      return nextIndex < array.length
        ? { value: array[nextIndex++], done: false }
        : { value: undefined, done: true };
    },
  };
}
