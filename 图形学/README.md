如何做canvas的dpr适配？
假设我们需要在css上展示的大小是400*260，我们在js中可以这么写

var canvas = document.getElementById("timePie")
canvas.height = 260 * dpr
canvas.width = 400 * dpr
css中这么写

#timePie{
  height: 260px;
  width: 400px;
}
其中canvas.height,canvas.width就好比需要加载图片的高和宽，而css中的height,width则是实际显示图片的高和宽。这样的好处自然就显而易见了，canvas的大小随着dpr变化，然而最后呈现出来的图片的css像素大小是不变的。这样就避免了canvas在高dpr屏幕下的模糊不清。