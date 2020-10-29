// 力扣（LeetCode）：https://leetcode-cn.com/problems/remove-nth-node-from-end-of-list

// 给定一个链表，删除链表的倒数第 n 个节点，并且返回链表的头结点。

// 示例：
// 给定一个链表: 1->2->3->4->5, 和 n = 2.
// 当删除了倒数第二个节点后，链表变为 1->2->3->5.

function ListNode(val, next) {
  this.val = (val===undefined ? 0 : val)
  this.next = (next===undefined ? null : next)
}
var removeNthFromEnd = function(head, n) {
  let dummy = new ListNode()
  dummy.next = head
  let slow = dummy
  let fast = dummy
  while(n-- >= 0) {
      fast = fast.next
  }

  while(fast) {
      slow = slow.next
      fast = fast.next
  }

  slow.next = slow.next.next

  return dummy.next
};
