// 力扣（LeetCode）https://leetcode-cn.com/problems/jewels-and-stones

// 给定字符串J 代表石头中宝石的类型，和字符串 S代表你拥有的石头。 S 中每个字符代表了一种你拥有的石头的类型，你想知道你拥有的石头中有多少是宝石。
// J 中的字母不重复，J 和 S中的所有字符都是字母。字母区分大小写，因此"a"和"A"是不同类型的石头。

// 输入: J = "aA", S = "aAAbbbb"
// 输出: 3
// 输入: J = "z", S = "ZZ"
// 输出: 0

// 方法一
function numJewelsInStones(J, S) {
  let sMap = {}
  let sum = 0
  for (let s of J) {
      sMap[s] = 1
  }
  for(let s of S) {
      if (sMap[s]) sum++
  }
  return sum
}

// 方法二
function numJewelsInStones2(J, S) { // 可以用正则表达式，思路清奇
  return S.length - S.replace(new RegExp(`[${J}]`, 'g'), '').length
}
