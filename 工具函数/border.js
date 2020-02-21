// 调试页面的时候可以所有元素加边框，方便调试
[].forEach.call($$("*"), function (a) { // $$ 是在控制台中才能这样写，相当于 document.querySelectorAll
  a.style.outline = "1px solid #" + (~~(Math.random() * (1 << 24))).toString(16);
})
