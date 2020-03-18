// 方法一：手动遍历拷贝
function copy(obj) {
  let newObj = {}
  for(let key in obj) {
    newObj[key] = obj[key]
  }
  return newObj
}

// 方法二：投机取巧的浅拷贝
Object.assign({}, obj)
[].concat(arr)
arr.slice(0)
[...obj]

// 完整点
function copy2(value) {
  if (typeof value === 'object' && value !== null) {
    let result = Array.isArray(value) ? [] : {}
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        result[key] = object[key];
      }
    }
    return result
  } else {
    return value
  }
}
