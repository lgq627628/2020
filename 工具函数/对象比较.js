/**
 * 比较两个对象的值是否相等，如 a = {c:1} 和 b = {c:1} 是相等的
 * 先遍历 a 中的每一个成员是否都在 b 中，并且与 b 中对应成员相等
 * 再遍历 b 中的每一个成员是否都在 a 中，并且与 a 中对应成员相等
 * 期间要注意如果是引用类型就递归调用
 * 这里面没有考虑正则等其他对象，因为大部分时候不需要，如果需要的话就加上一个 else if
 * 下面这个函数是从 vue2 源码的工具函数中摘出来的
 */
function looseEqual (a, b) {
  if (a === b) { return true }
  var isObjectA = isObject(a);
  var isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      var isArrayA = Array.isArray(a);
      var isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i])
        })
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key])
        })
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}
