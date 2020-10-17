// 题目描述：给出一个区间的集合，请合并所有重叠的区间。
// 示例 1:
// 输入: [[1,3],[2,6],[8,10],[15,18]]
// 输出: [[1,6],[8,10],[15,18]]
// 解释: 区间 [1,3] 和 [2,6] 重叠, 将它们合并为 [1,6].

// 示例 2:
// 输入: [[1,4],[4,5]]
// 输出: [[1,5]]
// 解释: 区间 [1,4] 和 [4,5] 可被视为重叠区间。
function mergeInterval(arr) {
  if (!arr || !arr.length) return []
  arr.sort((a, b) => a[0] - b[0])
  let rs = [arr[0]]
  for(let i = 1; i < arr.length; i++) {
    let prev = rs[rs.length - 1]
    if (arr[i][0] > prev[1]) {
      rs.push(arr[i])
    } else {
      prev[1] = Math.max(prev[1], arr[i][1])
    }
  }
  return rs;
}

let rs = mergeInterval([[1,3],[8,10],[15,18],[2,6]])
console.log(rs)
rs = mergeInterval([[1,4],[4,5]])
console.log(rs)
