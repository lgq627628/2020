function getCss(obj, attr) {
  if (obj.currentStyle) {
    return obj.currentStyle[attr]
  } else {
    return getComputedStyle(obj, false)[attr]
  }
}

// 一键换肤
// 可能有些同学会问，Sass和Less早就实现了变量该特性，何必再多此一举呢？可是细想一下，变量对比Sass变量和Less变量又有它的过人之处。
// 浏览器原生特性，无需经过任何转译可直接运行
// DOM对象一员，极大便利了CSS与JS间的联系
["red", "blue", "green"].forEach(v => {
  const btn = document.getElementById(`${v}-theme-btn`);
  btn.addEventListener("click", () => document.body.style.setProperty("--bg-color", v));
});
