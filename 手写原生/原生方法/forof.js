// 它背后的机制是 iterator 机制
for(let e of [1, 2, 3, 4, 5])
console.log(e);


// 我们可以给任何一个对象添加 iterator，使它可以用于 for of 语句，看下示例：
let o = {
  [Symbol.iterator]:() => ({
      _value: 0,
      next(){
          if(this._value == 10)
              return {
                  done: true
              }
          else return {
              value: this._value++,
              done: false
          };
      }
  })
}
for(let e of o)
  console.log(e);


  function* foo(){
    yield 0;
    yield 1;
    yield 2;
    yield 3;
}
for(let e of foo())
    console.log(e);
