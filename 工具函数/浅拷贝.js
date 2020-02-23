// 方法一：手动遍历拷贝
function copy(obj) {
  let newObj = {}
  for(let key in obj) {
    newObj[key] = obj[key]
  }
  return newObj
}

// 方法二：Object.assign()
Object.assign(newObj, obj)
