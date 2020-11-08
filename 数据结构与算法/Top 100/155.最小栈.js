// 力扣（LeetCode）：https://leetcode-cn.com/problems/min-stack

// 设计一个支持 push ，pop ，top 操作，并能在常数时间内检索到最小元素的栈。

// push(x) —— 将元素 x 推入栈中。
// pop() —— 删除栈顶的元素。
// top() —— 获取栈顶元素。
// getMin() —— 检索栈中的最小元素。

/**
 * 方法一：辅助栈，递减栈
 */
var MinStack = function() {
  this.stack = []
  this.minStack = []
};

/**
* @param {number} x
* @return {void}
*/
MinStack.prototype.push = function(x) {
  this.stack.push(x)
  if (this.minStack.length) {
      if (x <= this.minStack[this.minStack.length - 1])  this.minStack.push(x)
  } else {
      this.minStack.push(x)
  }
};

/**
* @return {void}
*/
MinStack.prototype.pop = function() {
  let val = this.stack.pop()
  if (val === this.minStack[this.minStack.length - 1]) this.minStack.pop()
  return val
};

/**
* @return {number}
*/
MinStack.prototype.top = function() {
  return this.stack[this.stack.length - 1]
};

/**
* @return {number}
*/
MinStack.prototype.getMin = function() {
  return this.minStack[this.minStack.length - 1]
};

/**
* Your MinStack object will be instantiated and called as such:
* var obj = new MinStack()
* obj.push(x)
* obj.pop()
* var param_3 = obj.top()
* var param_4 = obj.getMin()
*/


// 方法二：在入栈的时候除了添加值，顺便添加最小值
// 比如：this.stack.push([val, min]) || this.stack.push({val, min})
