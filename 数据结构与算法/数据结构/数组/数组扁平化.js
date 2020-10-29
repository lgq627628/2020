let arr = [
  [1, 2, 3],
  [
    [4, 5, 6],
    [7, 8],
    [9,
      [10]
    ]
  ]
]

let newArr1 = arr.flat(Infinity) // 平铺层级参数，不传为 1
let newArr2 = arr.toString().split(',') // 但得注意结果是字符串
let newArr3 = JSON.stringify(arr).replace(/(\[|\])/g, '').split(',')

console.log(newArr1, newArr2, newArr3)


// 正经处理：循环数组每一项，检测是否为数组，进行递归
let newArr = JSON.parse(JSON.stringify(arr))
while(newArr.some(item => Array.isArray(item))) {
  newArr = [].concat(...newArr)
}
console.log(newArr)


(function () {
  function myFlat() {
      let result = [],
          _this = this;
      //=>循环ARR中的每一项，把不是数组的存储到新数组中
      let fn = (arr) => {
          for (let i = 0; i < arr.length; i++) {
              let item = arr[i];
              if (Array.isArray(item)) {
                  fn(item);
                  continue;
              }
              result.push(item);
          }
      };
      fn(_this);
      return result;
  }
  Array.prototype.myFlat = myFlat;
})();


// 下面是：扁平化数组(扁平所有)
const deepFlatten = arr => arr.reduce((a, v) => a.concat(Array.isArray(v) ? deepFlatten(v) : v), []);
// deepFlatten(['a',['b'],[['c'],'d']]) -> ['a','b','c','d']
//如果所要展开的只有一层 可以直接使用 es6 的 Array.flat()，且只能展开一层
['a',['b'],['c'],'d'].flat() -> ['a','b','c','d']'a',['b'],[['c'],'d']].flat() -> ["a", "b", ['c'], "d"]


// 下面是：扁平化指定深度的数组
const flattenDepth = (ary, depth = 1) =>
depth != 1 ? ary.reduce((a, v) => a.concat(Array.isArray(v) ? flattenDepth(v, depth - 1) : v), [])
: ary.flat();
// flattenDepth(['a','b',['c'],[['d','e',['f'] ]]], 2) ->  ["a", "b", "c", "d", "e", ['f']]
