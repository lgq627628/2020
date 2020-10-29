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





// 递减栈的应用一：
// xx、最小栈问题
function MinStack() {
  this.stack = [];
  this.stack2 = [];
}
MinStack.prototype.push = val => {
  this.stack.push(val);
  if (val <= this.stack2[this.stack2.length - 1] || this.stack2.length < 1) this.stack2.push(val);
}
MinStack.prototype.pop = () => {
  let val = this.stack.pop();
  if (val === this.stack2[this.stack2.length - 1]) this.stack2.pop();
}
MinStack.prototype.top = () => {
  return this.stack[this.stack.length - 1];
}
MinStack.prototype.getMin = () => {
  return this.stack2[this.stack2.length - 1];
}



// 递减栈的应用二：
// 题目描述: 根据每日气温列表，请重新生成一个列表，对应位置的输出是需要再等待多久温度才会升高超过该日的天数。如果之后都不会升高，请在该位置用 0 来代替。
// 例如，给定一个列表 temperatures = [73, 74, 75, 71, 69, 72, 76, 73]，你的输出应该是 [1, 1, 4, 2, 1, 1, 0, 0]。
function dayTemperature(arr) {
  let rs = new Array(arr.length).fill(0)
  let stack = []
  for(let i = 0; i < arr.length; i++) {
    while(stack.length && arr[stack[stack.length - 1]] < arr[i]) {
        let idx = stack.pop()
        rs[idx] = i - idx
    }
    stack.push(i)
  }
  return rs
}
console.log(dayTemperature([73, 74, 75, 71, 69, 72, 76, 73])) // [1, 1, 4, 2, 1, 1, 0, 0]

// 递减栈：155, 496, 901, 42, 84




// xx、双栈模拟队列
function Queue() {
  this.stack1 = [] // 只进
  this.stack2 = [] // 只出
}
Queue.prototype.push = val => {
  this.stack1.push(val)
}
Queue.prototype.pop = () => {
  if (!this.stack2.length) {
    while(this.stack1.length) {
      this.stack2.push(this.stack1.pop())
    }
  }
  return this.stack2.pop()
}
Queue.prototype.peek = () => {
  if (!this.stack2.length) {
    while(this.stack1.length) {
      this.stack2.push(this.stack1.pop())
    }
  }
  return this.stack2.length ? this.stack2[this.stack2.length - 1] : null
}
Queue.prototype.empty = () => {
  return !this.stack.length && !this.stack2.length
}
