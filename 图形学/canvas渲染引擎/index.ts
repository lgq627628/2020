export const canvas: HTMLCanvasElement = document.getElementById('xx') as HTMLCanvasElement;
export const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d');

// 基于时间的运动才能保证在所有情况下都能以相同速度播放

// 基本循环
function loop(t) {
    // 这里的清屏本应该造成瞬间闪烁，但是浏览器采用了双缓冲技术
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    // 这个 beginPath 是个坑
    ctx2d.beginPath();
    ctx2d.rect(Math.random() * 600, Math.random() * 600, 100, 100);
    ctx2d.stroke();
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
