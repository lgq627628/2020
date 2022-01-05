// 假设 style 上面的 width 和 height 是 1:1，则 canvas 上面的 width 和 height 是 dpr * dpr，但是要缩放 dpr 倍
function dprCanvas() {
    const canvas = document.getElementById(id)
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio
    const logicalWidth = canvas.width
    const logicalHeight = canvas.height
    
    canvas.width = logicalWidth * dpr
    canvas.height = logicalHeight * dpr
    canvas.style.width = logicalWidth + 'px'
    canvas.style.height = logicalHeight + 'px'
    
    ctx.scale(dpr, dpr)
}

function makeHighRes(canvas) {
    var ctx = canvas.getContext('2d');
    // Get the device pixel ratio, falling back to 1.               
    var dpr = window.devicePixelRatio || window.webkitDevicePixelRatio || window.mozDevicePixelRatio || 1;

    // Get the size of the canvas in CSS pixels.
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    canvas.width = Math.round(oldWidth * dpr);
    canvas.height = Math.round(oldHeight * dpr);
    canvas.style.width = oldWidth + 'px';
    canvas.style.height = oldHeight + 'px';
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx.scale(dpr, dpr);
    return ctx;
}
