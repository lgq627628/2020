// 翻转二叉树
function invertTree(root) {
  if (!root) return;
  let { left, right } = root;
  root.left = right;
  root.right = left;
  invertTree(root.left);
  invertTree(root.right);
  // let right = invertTree(root.right);
  // let left = invertTree(root.left);
  // root.left = right;
  // root.right = left;
  return root;
}
const root = {
  val: "A",
  left: {
    val: "B",
    left: {
      val: "D"
    },
    right: {
      val: "E"
    }
  },
  right: {
    val: "C",
    right: {
      val: "F"
    }
  }
};


function tree2Arr(node) { // 中序遍历
  return node ? tree2Arr(node.left).concat(node.val, tree2Arr(node.right)) : []
}

// 求二叉树的最大深度
var maxDepth = function(root) {
  if (!root) return 0
  return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1
};

// 求二叉树的最小深度
var minDepth = function(root) {
    if (!root) return 0
    let deep = 0
    if (!root.left || !root.right) {
        deep = Math.max(minDepth(root.left), minDepth(root.right)) + 1
    } else {
        deep = Math.min(minDepth(root.left), minDepth(root.right)) + 1
    }
    return  deep
};

// 合并两棵树的值
var mergeTrees = function(t1, t2) {
  if (!t1) return t2
  if (!t2) return t1
  let root = new TreeNode(t1.val + t2.val) // 这个 root 也可以直接换成 t1 或 t2
  root.left = mergeTrees(t1.left, t2.left)
  root.right = mergeTrees(t1.right, t2.right)
  return root
};


// 将二叉树转为链表
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



// 判断二叉搜索树
// 方法一：递归
// 时间和空间复杂度都是 O(n)
// 注意：不是每个节点的右值 > 中值 > 左值就行，是要整个右树 > 中值 > 整个左子树
var isValidBST = function(root) {
  function dfs(root, min, max) {
      if (!root) return true
      if (root.val <= min || root.val >= max) return false
      return dfs(root.left, min, root.val) && dfs(root.right, root.val, max)
  }
  return dfs(root, -Infinity, Infinity)
};







// 将排序数组转化为二叉搜索树
function sortedArr2BST(arr) {
  if (!arr.length) return null;
  let midIdx = ~~(arr.length / 2);
  let tempNode = new TreeNode(arr[midIdx]);
  tempNode.left = sortedArr2BST(arr.slice(0, midIdx));
  tempNode.right = sortedArr2BST(arr.slice(midIdx + 1));
  return tempNode;
}

let rs2 = sortedArr2BST([-10,-3,0,5,9]);
console.log(rs2);





// 大数相乘
function multiply(a, b) {
  let res = new Array(a.length + b.length).fill(0);

  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      let mul = a[i] * b[j];
      let prePos = i + j;
      let pos = i + j + 1;
      let sum = mul + res[pos];

      res[prePos] += Math.floor(sum / 10);
      res[pos] = sum % 10;
    }
  }

  while (res[0] === 0 && res.length > 1) {
    res.shift();
  }

  return res.join('');
}







// 给定一个二叉树，判断它是否是高度平衡的二叉树
function isBalance(root) {
  let flag = true // 立一个flag，只要有一个高度差绝对值大于1，这个flag就会被置为false
  function dfs(root) {
    if (!root || !flag) return 0;

    let leftDeep = dfs(root.left);
    let rightDeep = dfs(root.right);
    if (Math.abs(leftDeep - rightDeep) > 1) {
      flag = false;
      return 0; // 后面再发生什么已经不重要了，返回一个不影响回溯计算的值
    }
    return Math.max(leftDeep, rightDeep) + 1;
  }

  dfs(root);
  return flag;
}





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