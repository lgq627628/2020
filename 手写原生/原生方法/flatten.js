function flatten(arr){
  var res = [];
  for(var i=0;i<arr.length;i++){
      if(Array.isArray(arr[i])){
          res = res.concat(flatten(arr[i]));
      }else{
          res.push(arr[i]);
      }
  }
  return res;
}


function flatten(arr){
  return arr.reduce(function(prev,item){
      return prev.concat(Array.isArray(item)?flatten(item):item);
  },[]);
}


function flatten(arr){
  while(arr.some(item=>Array.isArray(item)){
      arr = [].concat(...arr);
  }
  return arr;
}





// Example
let givenArr = [[1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14]]]], 10];
let outputArr = [1,2,2,3,4,5,5,6,7,8,9,11,12,12,13,14,10]
