// 滚动可视区域高度 + 当前滚动位置 === 整个滚动高度
// scrollDom.clientHeight + scrollDom.scrollTop === scrollDom.scrollHeight

window.onscroll = () => {
  // 或者是用 document.body
  let scrollTop = document.documentElement.scrollTop
  let scrollHeight = document.documentElement.scrollHeight
  let clientHeight = document.documentElement.clientHeight
  if (Math.ceil(scrollTop) + clientHeight >= scrollHeight) {
    console.log('触底了')
  }
}

// 滚动到顶部
window.scrollTo(0, 0)
document.body.scrollTop = 0;
document.documentElement.scrollTop = 0;

// 匀速滚动到顶部
let y = document.documentElement.scrollTop
let timer = setInterval(() => {
  y -= 10
  document.documentElement.scrollTop = y
  if (y <= 0) clearInterval(timer)
}, 10);


// 缓动滚动到顶部
let y = document.documentElement.scrollTop
let timer = setInterval(() => {
  y -= (document.documentElement.scrollTop / 10)
  document.documentElement.scrollTop = y
  if (y <= 0) clearInterval(timer)
}, 10);


// 滚动到顶部
const scrollToTop = _ => {
  const c = document.documentElement.scrollTop || document.body.scrollTop; //获取到顶端的距离
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);//滚动动画效果
    window.scrollTo(0, c - c / 8);
  }
};


// ios 键盘遮挡
setTimeout(function(){
  document.body.scrollTop = document.body.scrollHeight;
},300);


// 滚动到底部
let div = document.getElementById('divDetail'); 
div.scrollTop = div.scrollHeight; 

let dom = document.querySelector('textarea');
// div滚动事件
dom.onscroll = () => {
    
  // 意思就是内容总体的高度 - 滚动条的偏移值  === 元素的高度(包含内边)但不包含外边距，边框，以及滚动条
  if (dom.scrollHeight - dom.scrollTop === dom.clientHeight) {
    console.log('到达底部 do something');
  }

  // div滚到时：离底部不到30px时触发
  if (dom.scrollHeight - dom.scrollTop - dom.clientHeight <= 30) {
    console.log('离底部不到30px 提前发送请求');
  }
};