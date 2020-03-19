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
