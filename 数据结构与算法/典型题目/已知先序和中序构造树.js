// 已知先序（或后序）和中序构造树：递归截取每个先序遍历的首个元素：https://juejin.im/book/6844733800300150797/section/6844733800371453960
//         root  |<-左子树->|   |<- 右子树 ->|
//          ↓
// 前序序列  p1    p2......pk   p(k+1)......pn

//            |<- 左子树 ->|    root  |<- 右子树 ->|
//                              ↓
// 中序序列  i1 i2......i(k-1)   ik   i(k+1)......in

function buildTree(preOrder, inOrder) {
  if(preOrder.length < 1) return null

  let val = preOrder[0]
  let root = new TreeNode(val)
  let idx = inOrder.indexOf(val)
  root.left = buildTree(preOrder.slice(1, idx + 1), inOrder.slice(0, idx)) // 当然也可以不用传数组的方式，如果想节约空间，可以只传下标
  root.right = buildTree(preOrder.slice(idx + 1), inOrder.slice(idx + 1))
  return root
}

function TreeNode(val) {
  this.val = val;
  this.left = this.right = null;
}

let rs = buildTree([3,9,20,15,7], [9,3,15,20,7])
console.log(rs)
