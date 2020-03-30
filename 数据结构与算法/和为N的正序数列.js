// 输入一个正数 N，输出所有和为 N 的连续正数序列
// 比如输入 15
// 结果为 [[1,2,3,4,5], [4,5,6], [7,8]]

function hh(num) {
  let mid = Math.ceil(num / 2)
  let arr = []
  for(let i=1; i<=mid; i++) {
    let rs = i
    let temp = [i]
    let next = i
    while(rs < num) {
      temp.push(++next)
      rs += next
    }
    if (rs === num) arr.push(temp)
  }
  return arr
}
let rs = hh(15)
console.log(rs)






// 套用求和公式
function fn(count){
  let result=[];
  //=>求出中间值
  let middle=Math.ceil(count/2);
  //从1开始累加
  for(let i=1;i<=middle;i++){
      //控制累加多少次
      for(let j=2;;j++){
          //求出累加多次的和
          let total=(i+(i+j-1))*(j/2);
          if(total>count){
              break;
          }else if(total===count){
              result.push(createArr(i,j));
              break;
          }
      }
  }
  return result;
}
function createArr(n,len){
  let arr=new Array(len).fill(null),
      temp=[];
  arr[0]=n;
  arr=arr.map((item,index)=>{
      if(item===null){
          item=temp[index-1]+1;
      }
      temp.push(item);
      return item;
  });
  return arr;
}
