// 归并排序：先把数组切一半（从上往下），分别排序，再合并（从下往上），递归下去
function mergeSort(arr) { // 假设本次时间为 F(n)
  if (arr.length <= 1) return arr;

  let mid = ~~(arr.length / 2);
  let leftArr = mergeSort(arr.slice(0, mid)); // 则左侧时间为 F(n/2)
  let rightArr = mergeSort(arr.slice(mid)); // 则右侧时间为 F(n/2)
  return mergeArr(leftArr, rightArr); // 合并两个数组的时间 O(n)
}

function mergeArr(arr1, arr2) { // 合并两个有序数组
  const rs = [];
  let i = 0;
  let j = 0;
  while(i < arr1.length && j < arr2.length) {
    if(arr1[i] < arr2[j]) {
      rs.push(arr1[i]);
      i++;
    } else {
      rs.push(arr2[j]);
      j++;
    }
  }
  if (i < arr1.length) {
    return rs.concat(arr1.slice(i));
  } else {
    return rs.concat(arr2.slice(j));
  }
}


let rs = mergeArr([1,3,5], [2,4,6,8]);
console.log(rs);

let list = mergeSort([1,10,2,8,5,3,1,6,9]);
console.log(list);


// 时间复杂度分析
// ==============================================
// 方法一：基于数学计算的分析
// 我们假设规模为 n 的数组对应的排序的时间复杂度是一个关于 n 的函数 F(n)。那么它和自己的两个子数组之间就有如下关系：

// F(n) = F(n/2) + F(n/2) + 合并两个数组的时间
// 合并两个数组的过程一共要对 n 个元素进行一轮循环，因此时间复杂度可以目测出来是 O(n)，代入上面公式：

// F(n) = F(n/2) + F(n/2) + O(n) = 2^1*F(n/2)+2^0*O(n)
// 继续细分，两个子数组被划分为四个子数组，仍然遵循上面公式所描述的关系。代入 n/4 后可以得到四个子数组和大数组之间的关系：

// F(n/2) = 2*F(n/4)+O(n)

// F(n) = 2*(2*F(n/4)+O(n))+O(n) = 2^2*F(n/4)+2^1*O(n)
// 这样不断划分下去，直到每个序列里只有一个数位置。对于规模为 n 的数组来说，需要划分的次数为 log(n)，用 log(n) 替换掉上述公式中的2的次数，我们就可以得到归并排序的时间复杂度：

// F(n) = nF(1) + O(nlog(n)) = O(nlog(n))
// 综上所述， 归并排序的时间复杂度是 O(nlog(n))。

// =============================================
// 方法二：估算
// 我们把每一次切分+归并看做是一轮。对于规模为 n 的数组来说，需要切分 log(n) 次，因此就有 log(n) 轮。
// 因此单次切分对应的是常数级别的时间复杂度 O(1)。
// 再看合并，单次合并的时间复杂度为 O(n)。O(n) 和 O(1) 完全不在一个复杂度量级上，因此本着“抓主要矛盾”的原则，我们可以认为：决定归并排序时间复杂度的操作就是合并操作。
// log(n) 轮对应 log(n) 次合并操作，因此归并排序的时间复杂度就是 O(nlog(n))。
