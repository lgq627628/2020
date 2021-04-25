// 实现 sizeof 函数，传入一个 object，输出所占用字节
// 前提每种类型占用的大小是有标准规定的：数字 8 字节，一个字符 2 个字节，null 是 0，布尔值是 4 字节


let objCache = new WeakSet();

function calcSize(obj) {
  let type = typeof obj;
  switch (type) {
    case 'string':
      return obj.length * 2;
    case 'number':
      return 8; // 64 bit
    case 'boolean':
      return 4;
    case 'object':
      if (obj === null) {
        return 0;
      } else if (Array.isArray(obj)) {
        return obj.map(calcSize).reduce((prev, cur) => prev + cur, 0);
      } else {
        return calcObjSize(obj);
      }
    default:
      return 0;
  }
}

function calcObjSize(obj) {
  let size = 0;
  let keys = Object.keys(obj);

  for(let i = 0; i < keys.length; i++) {
    let k = keys[i];
    let val = obj[k];
    size += calcSize(k); // key 值一定要算
    if (typeof val === 'object' && val !== null) {
      if (objCache.has(val)) { // 相同引用不占用空间，所以不计数
        continue;
      } else {
        objCache.set(val)
      }
    }
    size += calcSize(obj[k]);
  }
  return size;
}


