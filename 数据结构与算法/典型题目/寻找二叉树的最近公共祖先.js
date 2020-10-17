// 寻找二叉树的最近公共祖先：https://juejin.im/book/6844733800300150797/section/6844733800375648264
// 若有效汇报个数为2，直接返回当前结点
// 若有效汇报个数为1，返回1所在的子树的根结点
// 若有效汇报个数为0，则返回空（空就是无效汇报）
function findLowestParent(root, p, q) {
  if (!root || root.val === p || root.val === q) return root // 若当前结点不存在（意味着无效）或者等于p/q（意味着找到目标），则直接返回

  let left = findLowestParent(root.left, p, q) // 向左子树去寻找p和q
  let right = findLowestParent(root.right, p, q) // 向右子树去寻找p和q

  if (left && right) return root // 如果左子树和右子树同时包含了p和q，那么这个结点一定是最近公共祖先
  return left || right // 如果左子树和右子树其中一个包含了p或者q，则把对应的有效子树汇报上去
}

const root = {
  val: 3,
  left: {
    val: 5,
    left: {
      val: 6
    },
    right: {
      val: 2,
      left: {
        val: 7
      },
      right: {
        val: 4
      }
    }
  },
  right: {
    val: 1,
    left: {
      val: 0
    },
    right: {
      val: 8
    }
  }
};


let rs = findLowestParent(root, 5, 1)
console.log(rs) // 3
rs = findLowestParent(root, 5, 4)
console.log(rs) // 5
