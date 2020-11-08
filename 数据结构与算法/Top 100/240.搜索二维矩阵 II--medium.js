// 力扣（LeetCode）：https://leetcode-cn.com/problems/search-a-2d-matrix-ii

// 编写一个高效的算法来搜索 m x n 矩阵 matrix 中的一个目标值 target。该矩阵具有以下特性：

// 每行的元素从左到右升序排列。
// 每列的元素从上到下升序排列。

// 示例:
// 现有矩阵 matrix 如下：
// [
//   [1,   4,  7, 11, 15],
//   [2,   5,  8, 12, 19],
//   [3,   6,  9, 16, 22],
//   [10, 13, 14, 17, 24],
//   [18, 21, 23, 26, 30]
// ]
// 给定 target = 5，返回 true。
// 给定 target = 20，返回 false。


// 方法一：以左下角或右上角为基准开始遍历
// 选左上角，往右走和往下走都增大，不能选
// 选右下角，往上走和往左走都减小，不能选
// 选左下角，往右走增大，往上走减小，可选
// 选右上角，往下走增大，往左走减小，可选
// 时间复杂度：O(n+m)。
// 空间复杂度：O(1)，因为这种方法只处理几个指针，所以它的内存占用是恒定的。
var searchMatrix = function(matrix, target) {
  if (!matrix.length) return false
  let row = matrix.length
  let col = matrix[0].length

  let i = row - 1
  let j = 0

  while(i >= 0 && i < row && j >= 0 && j < col) {
      if (matrix[i][j] === target) return true
      else if (matrix[i][j] > target) i--
      else j++
  }
  return false
};



// 方法二：从对角线找起，找到之后在当前元素的行和列中寻找


// 方法三：用二分法去找
