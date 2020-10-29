// 力扣（LeetCode）：https://leetcode-cn.com/problems/minimum-window-substring

// 给你一个字符串 S、一个字符串 T 。请你设计一种算法，可以在 O(n) 的时间复杂度内，从字符串 S 里面找出：包含 T 所有字符的最小子串。

// 示例：
// 输入：S = "ADOBECODEBANC", T = "ABC"
// 输出："BANC"
//  
// 提示：
// 如果 S 中不存这样的子串，则返回空字符串 ""。
// 如果 S 中存在这样的子串，我们保证它是唯一的答案。



// 方法一：暴力求解
// 1、只需要枚举长度大于 T 的即可
// 2、如果判断 s 包含 T 呢？就是对每个字符进行计数啦
// 时间复杂度：枚举需要 O(n^2) * 计数 O(n) = O(n^3)
// 空间复杂度：O(S + T)
// 当内层循环匹配到子串之后即可结束内层循环，继续外层循环，因为内层即便继续往后匹配到也只能是更长的子串



// 方法二：双指针 + 滑动窗口
// 思想：定义左右指针，移动右指针尽量扩充窗口直到包含整个 T 停止，此时移动左指针，尽量缩小窗口
/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
var minWindow = function(s, t) {
  let tMap = {}
  for(let tt of t) {
      if (!tMap[tt]) tMap[tt] = 0
      tMap[tt]++
  }
  let tTypes = Object.keys(tMap).length

  let len = s.length
  let left = 0
  let right = 0
  let minL = 0
  let minLen = Infinity

  while(right < len) {
      let ss = s[right]
      if (tMap[ss] !== undefined) tMap[ss]-- // 是目标字符就减一
      if (tMap[ss] === 0) tTypes-- // 某个目标字符个数变为0，总体个数就减一
      while (tTypes === 0) {
          if (right - left + 1 < minLen) {
              minL = left
              minLen = right - left + 1
          }
          let sss = s[left] // 获取左指针字符
          if (tMap[sss] !== undefined) tMap[sss]++ // 目标字符被舍弃就加一
          if (tMap[sss] === 1) tTypes++; // 如果缺失个数变为0，缺失的种类+1
          left++ // 收缩窗口
      }
      right++ // 扩展窗口
  }

  return minLen === Infinity ? '' : s.slice(minL, minL + minLen)
};
