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
