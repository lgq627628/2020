// 使用栈数据结构，左括号入栈，遇到右括号将左括号出栈，最后判断栈是否为空
// leetcode 20

function isVaild(str) { // 只判断括号
  if (typeof str !== 'string' || str === '') return true
  let stack = []
  let len = str.length
  for(let i = 0; i < len; i++) { // 时间复杂度 O(n)，空间复杂度为 stack 数组
    let val = str[i]
    if (val === '(') {
      stack.push(val)
    } else if (val === ')') {
      if (!stack.length) return false // 如果第一个就是 ) 就直接出错
      stack.pop()
    }
  }
  return stack.length === 0
}

console.log(isVaild('()('))
console.log(isVaild(')()'))
console.log(isVaild('(())'))

// 把上面的空间复杂度去掉栈，空间复杂度变为 O(1)
function isVaild(str) {
  if (typeof str !== 'string' || str === '') return true
  let sum = 0
  let len = str.length
  for(let i = 0; i < len; i++) {
    let val = str[i]
    if (val === '(') {
      sum++
    } else if (val === ')') {
      if (sum === 0) return false
      sum--
    }
  }
  return sum === 0
}


// 最长有效括号长度
// leetcode 32

// 暴力破解法，时间复杂度 O(n^2)
function maxVaildLen(s) {
  let max = 0
  if (s.length < 1) return max

  let len = s.length
  let stack = []
  let tempMax = 0

  for(let i = 0; i < len; i++) {
    tempMax = 0
    stack = []
    for(let j = i; j < len; j++) {
      let val = s[j]
      if (val === '(') {
        stack.push(val)
        tempMax++
      } else if (val === ')') {
        if (stack.length) {
          stack.pop()
          tempMax++
        } else {
          max = Math.max(max, tempMax)
          break
        }
      }
    }
    if (stack.length === 0) {
      max = Math.max(max, tempMax)
    }
  }
  return max
}

// 把上面暴力破解的复杂度降一降，用下标相减，就是可匹配长度
function maxVaildLen(s) {
  let max = 0
  if (s.length < 1) return max

  let len = s.length
  let stack = [-1]

  for(let i = 0; i < len; i++) {
    let value = s[i]
    if (value === '(') {
      stack.push(i)
    } else if (value === ')') {
      stack.pop()
      if (stack.length < 1) {
        stack.push(i)
      } else {
        max = Math.max(max, i - stack[stack.length - 1])
      }
    }
  }
  return max
}

// 继续优化上面的代码，不用栈
function maxVaildLen(s) {
  let max = 0
  if (s.length < 1) return max

  let len = s.length
  let left = 0
  let right = 0

  for(let i = 0; i < len; i++) {
    let value = s[i]
    if (value === '(') {
      left++
    } else if (value === ')') {
      right++
    }
    if (left < right) {
      left = right = 0
    } else if (left === right) {
      max = Math.max(max, 2 * right)
    }
  }

  left = 0
  right = 0
  for(let i = len - 1; i >= 0; i--) {
    let value = s[i]
    if (value === '(') {
      left++
    } else if (value === ')') {
      right++
    }
    if (left > right) {
      left = right = 0
    } else if (left === right) {
      max = Math.max(max, 2 * left)
    }
  }
  return max
}
// 下面这种写法没差
function maxVaildLen(s) {
  let max = 0
  if (s.length < 1) return max

  let len = s.length
  let left = 0
  let right = 0
  let left1 = 0
  let right1 = 0

  for(let i = 0, j = len-1; i < len; i++, j--) {
    let value = s[i]
    let value1 = s[j]
    if (value === '(') {
      left++
    } else if (value === ')') {
      right++
    }
    if (left < right) {
      left = right = 0
    } else if (left === right) {
      max = Math.max(max, 2 * right)
    }

    if (value1 === '(') {
      left1++
    } else if (value1 === ')') {
      right1++
    }
    if (left1 > right1) {
      left1 = right1 = 0
    } else if (left1 === right1) {
      max = Math.max(max, 2 * left1)
    }
  }

  return max
}

console.log(maxVaildLen('()(()'))
console.log(maxVaildLen('((((('))
console.log(maxVaildLen('(()()'))
console.log(maxVaildLen(')()())'))
console.log(maxVaildLen('(()))())('))
console.log(maxVaildLen(')(((((()())()()))()(()))('))
