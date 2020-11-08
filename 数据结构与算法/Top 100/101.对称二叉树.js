// 力扣（LeetCode）：https://leetcode-cn.com/problems/symmetric-tree

// 给定一个二叉树，检查它是否是镜像对称的。

// 例如，二叉树 [1,2,2,3,4,4,3] 是对称的。
//     1
//    / \
//   2   2
//  / \ / \
// 3  4 4  3

// 但是下面这个 [1,2,2,null,3,null,3] 则不是镜像对称的:
//     1
//    / \
//   2   2
//    \   \
//    3    3


/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {boolean}
 */

// 思路：逐步比较两个 root

var isSymmetric = function(root) {
  let stack = [root, root]
  let left
  let right
  while(stack.length) {
      left = stack.shift()
      right = stack.shift()
      if (left || right) {
          if (!left || !right || left.val !== right.val) return false
          stack.push(left.left, right.right, left.right, right.left)
      }
  }
  return true
};



var isSymmetric = function(root) {
  function check(root1, root2) {
      if (root1 || root2) {
          if (!root1 || !root2 || root1.val !== root2.val) return false
          return check(root1.left, root2.right) && check(root1.right, root2.left)
      } else {
          return true
      }
  }
  return check(root, root)
};
