// 看看 jQuery 的拷贝 https://github.com/jquery/jquery/blob/1472290917f17af05e98007136096784f9051fab/src/core.js#L121
// 深拷贝要注意循环引用导致的死循环的问题
function deepClone(obj) {
  // 如果是 值类型 或 null，则直接return
  if(typeof obj !== 'object' || obj === null) {
      return obj
  }
  
  // 定义结果对象
  let copy = {}
  
  // 如果对象是数组，则定义结果数组
  if(obj.constructor === Array) {
      copy = []
  }
  
  // 遍历对象的key
  for(let key in obj) {
      // 如果key是对象的自有属性
      if(obj.hasOwnProperty(key)) {
          // 递归调用深拷贝方法
          copy[key] = deepClone(obj[key])
      }
  }
  
  return copy
} 




function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) return obj
  if (obj instanceof RegExp || obj instanceof Date) {
    return new obj.constructor(obj)
  }
  let newObj = new obj.constructor
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = deepCopy(obj[key])
    }
  }
  return newObj
}

function deepCopy1(obj) {
  let newObj = new obj.constructor() // 因为这里需要判断是对象还是数组还是函数，否则 constructor 都是对象
  for(let key in obj) {
    let value = obj[key]
    if (value instanceof Object) {
      newObj[key] = deepCopy(value)
    } else {
      newObj[key] = value
    }
  }
  return newObj
}



// 完整点
function deepCopy2(value) {
  if (typeof value === 'object' && value !== null) {
    let result = Array.isArray(value) ? [] : {}
    for (const key in value) {
      if (!value.hasOwnProperty(key)) break // 能走到这里肯定是到原型上了
      result[key] = deepCopy2(object[key]);
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
      if (!value.hasOwnProperty(key)) break
      result[key] = deepCopy3(object[key], map);
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


// 深拷贝进阶：
// - 使用 immer，如果数据不改变，即便是拷贝我们仍然使用同一数据
// - 如果数据改变了，用 proxy 代理加一个中间层 draft，在中间层重新赋值改变的值，其余值还是会映射到原始数据，极大的提高了深拷贝性能