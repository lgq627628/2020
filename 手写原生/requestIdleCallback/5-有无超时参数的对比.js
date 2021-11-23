// 无超时
function work(deadline) {
  console.log(`当前帧剩余时间: ${deadline.timeRemaining()}`);
  requestIdleCallback(work);
}
requestIdleCallback(work);



// 有超时
function work(deadline) {
  console.log(`当前帧剩余时间: ${deadline.timeRemaining()}`);
  requestIdleCallback(work, { timeout: 1500 });
}
requestIdleCallback(work, { timeout: 1500 });