// 请判断一个链表是否为回文链表。

// 示例 1:
// 输入: 1->2
// 输出: false

// 示例 2:
// 输入: 1->2->2->1
// 输出: true
// 你能否用 O(n) 时间复杂度和 O(1) 空间复杂度解决此题？

// 先用快慢指针找到中点并把慢指针存入栈中 + 再从中点开始向后遍历判断是否回文 https://leetcode-cn.com/problems/palindrome-linked-list/solution/tu-jie-kuai-man-zhi-zhen-zhan-pan-duan-hui-wen-by-/
// 先用快慢指针找到中点并把慢指针存入栈中 + 反转后半部分链表判断是否回文 https://leetcode-cn.com/problems/palindrome-linked-list/solution/dan-ke-xi-lie-hui-wen-lian-biao-by-lvshanke/
// 转数组，用数组来判断
