export class Canvas2D {
    public ctx: CanvasRenderingContext2D | null

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')

    }
    drawText(text: string) {
        if (!this.ctx) return
        // canvas2d 和 webgl 这种底层绘图 api 都是状态机模式，
        // 也就是每次绘制前要 save 绘制后要 restore，好处是状态不会混乱
        // 怎么理解呢，比如你设置了当前画笔颜色，如果不使用 save/restore 配对函数的话，下次绘制也是这个颜色
        this.ctx.save()

        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'

        const x: number = this.ctx.canvas.width / 2
        const y: number = this.ctx.canvas.height / 2

        this.ctx.fillStyle = 'red'
        this.ctx.fillText(text, x, y)
        this.ctx.strokeStyle = 'green'
        
        // 将状态恢复到初始状态
        this.ctx.restore()
    }
}