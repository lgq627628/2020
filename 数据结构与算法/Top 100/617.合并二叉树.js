// 力扣（LeetCode）：https://leetcode-cn.com/problems/merge-two-binary-trees
// 输入:
// 	Tree 1                     Tree 2
//           1                         2
//          / \                       / \
//         3   2                     1   3
//        /                           \   \
//       5                             4   7
// 输出:
// 合并后的树:
// 	     3
// 	    / \
// 	   4   5
// 	  / \   \
// 	 5   4   7
var mergeTrees = function(t1, t2) {
  if (!t1) return t2
  if (!t2) return t1
  let root = new TreeNode(t1.val + t2.val) // 这个 root 也可以直接换成 t1 或 t2
  root.left = mergeTrees(t1.left, t2.left)
  root.right = mergeTrees(t1.right, t2.right)
  return root
};
// 上面这种的算法复杂度如下：
// 时间复杂度：O(min(m,n))，其中 mm 和 nn 分别是两个二叉树的节点个数。对两个二叉树同时进行深度优先搜索，只有当两个二叉树中的对应节点都不为空时才会对该节点进行显性合并操作，因此被访问到的节点数不会超过较小的二叉树的节点数。
// 空间复杂度：O(min(m,n))也就是O(h)，h 是树的高度，其中 mm 和 nn 分别是两个二叉树的节点个数。空间复杂度取决于递归调用的层数，递归调用的层数不会超过较小的二叉树的最大高度，最坏情况下，二叉树的高度等于节点数。


// 另外一种就是迭代遍历
