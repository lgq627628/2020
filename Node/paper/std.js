console.log('请输入一个要求和的整数，以0结束输入');

process.stdin.setEncoding('utf8');

let sum = 0;
process.stdin.on('readable', () => {
  const chunk = process.stdin.read(); // 获取当前输入的字符，包含回车
  const n = Number(chunk.slice(0, -1));
  sum += n;
  if(n === 0) process.stdin.emit('end');
  process.stdin.read(); // 再调用一次，返回的是null，并继续监听
});

process.stdin.on('end', () => {
  console.log(`求和结果是：${sum}`);
  process.exit();
});

// 注意，在这个回调函数中，当我们对输入的数字完成加法操作后，我们又调用了一次process.stdin.read()方法，这是为什么呢？
// 这是因为process.stdin.read()从标准输入流中读取内容，如果有内容，就会把读到的内容返回，如果没有内容，则会返回 null，并继续处于readable状态，监听下一次输入。所以如果我们不在readable事件回调函数里多调用一次process.stdin.read()，它只会将读到的内容返回，不会继续监听下一次输入。
// process.stdin是异步的，它继承EventEmitter对象，能够派发和监听事件。