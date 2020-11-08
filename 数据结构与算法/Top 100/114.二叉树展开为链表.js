// 力扣（LeetCode）：https://leetcode-cn.com/problems/flatten-binary-tree-to-linked-list

// 给定一个二叉树，原地将它展开为一个单链表。

// 例如，给定二叉树

//     1
//    / \
//   2   5
//  / \   \
// 3   4   6
// 将其展开为：

// 1
//  \
//   2
//    \
//     3
//      \
//       4
//        \
//         5
//          \
//           6




var flatten = function(root) {
  let cur = root
  while(cur) {
      if (cur.left) {
          let next = cur.left
          let next2 = next

          while(next2.right) {
              next2 = next2.right
          }
          next2.right = cur.right
          cur.left = null
          cur.right = next
      }
      cur = cur.right
  }
  return root
};
