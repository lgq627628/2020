// 力扣（LeetCode）：https://leetcode-cn.com/problems/invert-binary-tree

// 翻转一棵二叉树。

// 示例：
// 输入：

//      4
//    /   \
//   2     7
//  / \   / \
// 1   3 6   9
// 输出：

//      4
//    /   \
//   7     2
//  / \   / \
// 9   6 3   1

function revertTree(root) {
  if (!root) return null
  let left = revertTree(root.left)
  let right = revertTree(root.right)
  root.left = right
  root.right = left
  return root;
}
