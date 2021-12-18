import { Canvas2D } from './Canvas2D.ts'


let canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
let canvas2d: Canvas2D = new Canvas2D(canvas)
canvas2d.drawText('尤水就下')
