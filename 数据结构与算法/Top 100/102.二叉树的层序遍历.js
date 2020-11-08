// 力扣（LeetCode）：https://leetcode-cn.com/problems/binary-tree-level-order-traversal

// 给你一个二叉树，请你返回其按 层序遍历 得到的节点值。 （即逐层地，从左到右访问所有节点）。

// 示例：
// 二叉树：[3,9,20,null,null,15,7],

//     3
//    / \
//   9  20
//     /  \
//    15   7
// 返回其层次遍历结果：

// [
//   [3],
//   [9,20],
//   [15,7]
// ]


// 方法一：深度优先遍历，需要传递层级 level
var levelOrder = function(root) {
  if (!root) return []
  let rs = []

  function dfs(root, level) {
      if (!root) return
      if (!rs[level]) rs[level] = []

      rs[level].push(root.val)
      dfs(root.left, level + 1)
      dfs(root.right, level + 1)
  }
  dfs(root, 0)
  return rs
};


// 方法二：广度度优先遍历，先记录当前栈中元素长度
var levelOrder = function(root) {
  if (!root) return []
  let queue = [root]
  let rs = []
  while(queue.length) {
      let size = queue.length
      let temp = []
      while(size) {
          let top = queue.shift()
          temp.push(top.val)
          top.left && queue.push(top.left)
          top.right && queue.push(top.right)
          size--
      }
      rs.push(temp)
  }
  return rs
};
