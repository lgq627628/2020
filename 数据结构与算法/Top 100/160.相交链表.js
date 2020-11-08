// 力扣（LeetCode）：https://leetcode-cn.com/problems/intersection-of-two-linked-lists

// 编写一个程序，找到两个单链表相交的起始节点。



// 方法一: 暴力法
// 对链表A中的每一个结点 a_i，遍历整个链表 B 并检查链表 B 中是否存在结点和 a_i 相同。\
// 时间复杂度 : (mn)。
// 空间复杂度 : O(1)。



// 方法二: 哈希表法
// 遍历链表 A 并将每个结点的地址引用存储在哈希表中。然后检查链表 B 中的每一个结点 b_i 是否在哈希表中。若在，则 b_i 为相交结点。
// 时间复杂度 : O(m+n)。
// 空间复杂度 : O(m)O(m)。



// 方法三：双指针
// 链表 A 走完走 B，链表 B 走完走 A，也就是他们移动相同的距离（A + B）
var getIntersectionNode = function(headA, headB) {
  let pA =  headA
  let pB =  headB

  while(pA || pB) {
      if (pA === pB) return pA
      pA = pA ? pA.next : headB
      pB = pB ? pB.next : headA
  }

  return null
};
