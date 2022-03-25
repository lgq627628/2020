const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext('2d');



class Fenxing {
    public x: number = 0;
    public y: number = 0;
    public len: number = 50;
    public num: number = 6;
    constructor(num: number) {
        this.num = num ?? 6;
    }
    stroke() {
        const { len } = this;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.moveTo(0, 0);
        ctx.lineTo(len, 0);
        for (let i = 0; i < this.num; i++) {
            console.log('i', i);
            ctx.translate(len, 0);
            ctx.rotate(-60 * Math.PI / 180);
            ctx.lineTo(len, 0);
            ctx.translate(len, 0);
            ctx.rotate(120 * Math.PI / 180);
            ctx.lineTo(len, 0);
        }
        ctx.stroke();
        ctx.restore();
    }
}

(function frame() {
    // window.requestAnimationFrame(frame);

    // 2、清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const fening: Fenxing = new Fenxing(12);
    fening.x = canvas.width / 2;
    fening.y = canvas.height / 2;
    fening.stroke();
})()