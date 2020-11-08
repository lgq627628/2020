// 力扣（LeetCode）：https://leetcode-cn.com/problems/group-anagrams

// 给定一个字符串数组，将字母异位词组合在一起。字母异位词指字母相同，但排列不同的字符串。

// 示例:
// 输入: ["eat", "tea", "tan", "ate", "nat", "bat"]
// 输出:
// [
//   ["ate","eat","tea"],
//   ["nat","tan"],
//   ["bat"]
// ]

// 说明：
// 所有输入均为小写字母。
// 不考虑答案输出的顺序。


// 计数法
// https://leetcode-cn.com/problems/group-anagrams/solution/js-xie-leetcode-by-zhl1232-3/
var groupAnagrams = function(strs) {
  let hash = new Map()

  for(let i = 0; i < strs.length; i++) {
      let str = strs[i]
      let arr = Array(26).fill(0)
      for(let j = 0; j < str.length; j++) {
          arr[str.charCodeAt(j) - 97] ++
      }
      let hashKey = arr.join()
      if(hash.has(hashKey)) {
          let temp = hash.get(hashKey)
          temp.push(str)
          hash.set(hashKey, temp)
      } else {
          hash.set(hashKey, [str])
      }
  }
  return [...hash.values()]
};



// 质数法
// https://leetcode-cn.com/problems/group-anagrams/solution/js-xie-leetcode-by-zhl1232-3/
var groupAnagrams = function(strs) {
	let res = {};
	for(let i = 0; i < strs.length; i++) {
		const str = strs[i]
		const hash = str.split('').reduce((sum, s)=>{
			return sum * [3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103 ][s.charCodeAt(0) - 97]
		}, 1)
		res[hash] ? res[hash].push(str) : res[hash] = [str]
	}

	return Object.values(res)

};



// https://leetcode-cn.com/problems/group-anagrams/solution/js-xie-leetcode-by-zhl1232-3/
var groupAnagrams = function(strs) {
  let hash = new Map()

  for(let i = 0; i < strs.length; i++) {
      let str = strs[i].split('').sort().join()
      if(hash.has(str)) {
          let temp = hash.get(str)
          temp.push(strs[i])
          hash.set(str, temp)
      } else {
          hash.set(str, [strs[i]])
      }
  }

  return [...hash.values()]
};
