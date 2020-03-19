let arr = [1,6,3,2,7,2,4,6]
let ary = [1,6,3,2,7,2,4,6]

// 方法一：new Set
let arr1 = [...new Set(arr)]

// 方法二：双 for 循环：
for(let i=0;i<ary.length-1;i++){
	let item=ary[i],
		args=ary.slice(i+1);
	if(args.indexOf(item)>-1){
		//包含：我们可以把当前项干掉
		// splice删除
		// 1. 原来数组改变，这样如果i继续++，则会产生数组塌陷
		// 2. 性能不好：当前项一旦删除，后面项索引都要变
		// ary.splice(i,1);
		// i--;

		//赋值为null，后续filter一次
		// ary[i]=null;

		//用最后一项替换
		ary[i]=ary[ary.length-1];
		ary.length--;
		i--;
	}
}
// ary=ary.filter(item=>item!==null);

// 方法三：键值对
let obj={};
for(let i=0;i<ary.length;i++){
	let item=ary[i];
	if(typeof obj[item]!=='undefined'){
		ary[i]=ary[ary.length-1];
		ary.length--;
		i--;
		continue;
	}
	obj[item]=item;
}
obj=null;


// 方法四：先排序再相邻项比较（这里用正则）
arr.sort((a, b) => a - b)
let str = arr.join('@') + '@'
let newArr = []
str.replace(/(\d+@)\1*/g, (...args) => {
  // newArr.push(args[1].slice(0, args[1].length-1))
  newArr.push(parseFloat(args[1]))
})
console.log(str, newArr)
