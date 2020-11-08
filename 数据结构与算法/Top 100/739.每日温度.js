// 力扣（LeetCode）：https://leetcode-cn.com/problems/daily-temperatures

// 请根据每日 气温 列表，重新生成一个列表。对应位置的输出为：要想观测到更高的气温，至少需要等待的天数。如果气温在这之后都不会升高，请在该位置用 0 来代替。

// 例如，给定一个列表 temperatures = [73, 74, 75, 71, 69, 72, 76, 73]，你的输出应该是 [1, 1, 4, 2, 1, 1, 0, 0]。

// 提示：气温 列表长度的范围是 [1, 30000]。每个气温的值的均为华氏度，都是在 [30, 100] 范围内的整数。

var dailyTemperatures = function(T) {
  let stack = []
  let len = T.length
  let i = 0;
  let rs = new Array(len).fill(0);
  while(i < len) {
      while(stack.length) {
          let topIdx = stack[stack.length - 1];

          if (T[topIdx] < T[i]) {
              rs[topIdx] = i - topIdx
              stack.pop()
          } else {
              break;
          }
      }
      stack.push(i)
      i++
  }
  return rs;
};
