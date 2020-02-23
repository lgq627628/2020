function deepCopy(origin) {
  let obj = new origin.constructor() // 因为这里需要判断是对象还是数组还是函数，否则 constructor 都是对象
  for(let key in origin) {
    let value = origin[key]
    if (value instanceof Object) {
      obj[key] = deepCopy(value)
    } else {
      obj[key] = value
    }
  }
  return obj
}
