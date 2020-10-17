// 寻找两个正序数组的中位数
// 要求算法的时间复杂度为 O(log(m + n))
// 看到 logN 的复杂度就要想到二分法
// 因为要取的是中位数，所以我们先直接去取下标的中位数
// 然后从较短的数组中切一半，第二个数组（用中位数的下标减去数组一的左半边）也切一半
// 形如这样
//         L1   R1
// nums1 = [5, |6, 7]
//             L2  R2
// nums2 = [1, 2, |4, 12]
// 然后比较 L1 <= R1 && L1 <= R2 && L2 <= R1 && L2 <= R2 是否成立
// 若成立判断奇偶，取中位数；若不成立则将第一个数组的左半边（或右半边）继续二分，如此循环
function findMidNumer(arr1, arr2) {
  if (arr1.length > arr2.length) [arr1, arr2] = [arr2, arr1]
  console.log(arr1, arr2)
  let l1 = arr1.length
  let l2 = arr2.length
  let mid = Math.floor((l1 + l2) / 2)


}

let rs = findMidNumer([1,3], [2])
console.log(rs) // 2
rs = findMidNumer([1,2], [3,4])
console.log(rs) // 2.5
rs = findMidNumer([1,3,5], [2,4,6])
console.log(rs) // 3.5
