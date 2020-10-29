// 力扣（LeetCode）：https://leetcode-cn.com/problems/longest-palindromic-substring

// 给定一个字符串 s，找到 s 中最长的回文子串。你可以假设 s 的最大长度为 1000。
// 示例 1：

// 输入: "babad"
// 输出: "bab"
// 注意: "aba" 也是一个有效答案。
// 示例 2：

// 输入: "cbbd"
// 输出: "bb"


// 方法一：暴力破解 O(n^3)
function maxLongStr(s) {
  if (s.length <= 1) return s
  let rs = s[0]
  for(let i = 0; i < s.length; i++) {
    for(let j = i + 1; j < s.length; j++) {
      let tempStr = s.slice(i, j)
      if(isEqualStr(tempStr)) {
        if(rs.length < tempStr.length) rs = tempStr
      }
    }
  }
  return rs
}
function isEqualStr(str) {
  return str === str.split('').reverse().join('')
}

let rs = maxLongStr('babad')
console.log(rs) // bab 或者 aba
rs = maxLongStr('cbbd')
console.log(rs) // bb





// 方法二：以每个元素（可能是奇数中心，也可能是偶数中心）为中心向两边逐渐遍历
function maxLongStr2(s) {
  if (s.length <= 1) return s
  let rs = s[0]
  for(let i = 0; i < s.length; i++) {
    let left = i - 1
    let right = i + 1
    while(left >= 0 && right < s.length && s[left] === s[right]) {
      let tempStr = s.slice(left, right + 1)
      if (tempStr.length > rs.length) rs = tempStr
      left--
      right++
    }

    left = i
    right = i + 1
    while(left >= 0 && right < s.length && s[left] === s[right]) {
      let tempStr = s.slice(left, right + 1)
      if (tempStr.length > rs.length) rs = tempStr
      left--
      right++
    }
  }
  return rs
}
rs = maxLongStr2('babad')
console.log(rs) // bab 或者 aba
rs = maxLongStr2('cbbd')
console.log(rs) // bb





// 方法三：动态规划：https://alchemist-al.com/algorithms/longest-palindromic-substring
// 个人觉得这个只是把已经判断过的值缓存下来，本质还是穷举的味道，这种感觉好像正交，去除繁琐多余重复的步骤
// 这个题目能够明显的感受到动态规划是个递推的过程，先从最简单的算起，一步一步往后走，找关系（最难的地方）
// 3	  0	1	2	3	4	5
//      c	c	b	d	c	d
// 0	c	T	T	F	F	F	F
// 1	c		T	F	F	F	F
// 2	b			T	F	F	F
// 3	d				T	F	T
// 4	c					T	F
// 5	d						T
function maxLongStr3(s) {
  if (s.length <= 1) return s
  const dp = []
  let start = 0
  let end = 0
  for(let i = 0; i < s.length; i++) {
    dp[i] = [] // 初始化每一行
    dp[i][i] = true // 初始化一个元素的情况
    if (i + 1 < s.length) { // 初始化两个元素的情况
      dp[i][i + 1] = s[i] === s[i + 1]
      if (s[i] === s[i + 1]) {
        start = i
        end = i + 1
      }
    }
  }
  for (let n = 3; n <= s.length; n++) { // 3个3个走一遍，4个4个走一遍
    for(let i = 0; i <= s.length - n; i++) {
      let left = i
      let right = i + n - 1
      if (s[left] === s[right] && dp[left + 1][right - 1]) {
        dp[left][right] = true
        start = left // 及时记录下标，因为越往后越长，所以直接覆盖件即可
        end = right
      } else {
        dp[left][right] = false
      }
    }
  }
  console.log(dp)
  return s.slice(start, end + 1)
}
rs = maxLongStr3('ccbdcd')
console.log(rs) // dcd
rs = maxLongStr3('babad')
console.log(rs) // bab 或者 aba
rs = maxLongStr3('cbbd')
console.log(rs) // bb
