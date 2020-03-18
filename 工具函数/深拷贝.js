// 深拷贝要注意循环引用导致的死循环的问题

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



// 完整点
function deepCopy2(value) {
  if (typeof value === 'object' && value !== null) {
    let result = Array.isArray(value) ? [] : {}
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        result[key] = deepCopy2(object[key]);
      }
    }
    return result
  } else {
    return value
  }
}

// 解决循环引用
function deepCopy3(value, map = new Map) {
  if (typeof value === 'object' && value !== null) {
    if (map.get(value)) return map.get(value)
    let result = Array.isArray(value) ? [] : {}
    map.set(value, result) // 这个得写在循环前面
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        result[key] = deepCopy3(object[key], map);
      }
    }
    return result
  } else {
    return value
  }
}


// 解决特殊值类型，比如 Symbol 用 for 循环是取不到的
let obj = {a:1, b: {c: 2}}
obj[Symbol('a')] = '哈哈哈'

function deepCopy4(value, map = new Map) {
  if (typeof value === 'object' && value !== null) {
    if (map.get(value)) return map.get(value)
    let result = Array.isArray(value) ? [] : {}
    map.set(value, result) // 这个得写在循环前面
    Reflect.ownKeys(Array.isArray(value) ? [...value] : {...value}).forEach(key => {
        result[key] = deepCopy4(object[key]);
    })
    return result
  } else {
    return value
  }
}


// 解决特殊值类型，比如 new Date 取出的值为 {}
let obj = {a:1, b: {c: 2}, d: new Date, r: /hhh/}

function deepCopy5(value, map = new Map) {
  if (typeof value === 'object' && value !== null) {
    if (map.get(value)) return map.get(value)
    let result = Array.isArray(value) ? [] : {}
    map.set(value, result) // 这个得写在循环前面
    switch(value.constructor) {
      case RegExp:
        result = new value.constructor(value)
        break
      case Date:
        result = new value.constructor(value)
        break
      default:
        Reflect.ownKeys(Array.isArray(value) ? [...value] : {...value}).forEach(key => {
            result[key] = deepCopy5(object[key]);
        })
    }
    return result
  } else {
    return value
  }
}



// 解决特殊值类型，比如函数，Reflect 是无法取到原型链上的方法的，这种需要自定义拷贝
function User() {
}
User.prototype.xx = function(){}
let obj = {a: new User}
function deepCopy5(value, map = new Map) {
  if (typeof value === 'object' && value !== null) {
    if (map.get(value)) return map.get(value)
    let result = Array.isArray(value) ? [] : {}
    map.set(value, result) // 这个得写在循环前面
    switch(value.constructor) {
      case User: // 这里就是自定义拷贝
      case RegExp:
      case Date:
        result = new value.constructor(value)
        break
      default:
        Reflect.ownKeys(Array.isArray(value) ? [...value] : {...value}).forEach(key => {
            result[key] = deepCopy5(object[key]);
        })
    }
    return result
  } else {
    return value
  }
}





// 函数复制
function a() {
  console.log('1')
}
function copyFn(fn) {
  if (typeof fn !== 'function') return fn
  return eval(`(${fn.toString()})`)
}
