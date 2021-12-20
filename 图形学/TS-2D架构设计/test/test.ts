import { Application } from '../src/Application.ts';
import { CnavasMouseEvent, CnavasKeyboardEvent } from '../src/CnavasInputEvent.ts';

class ApplicationTest extends Application {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
    }
    protected dispatchKeyDown(e: CnavasKeyboardEvent): void {
        console.log('按下了', e.key);
    }
    protected dispatchMouseDown(e: CnavasMouseEvent): void {
        console.log('点击坐标', e.canvasPos);
    }
    update(dt: number, passingTime: number): void {
        console.log('时间间隔', dt, '流逝时间', passingTime);
    }
    render(): void {
        console.log('调用 render 方法');
    }
}


const canvas: HTMLCanvasElement | null = document.getElementById('canvas') as HTMLCanvasElement;
const app: Application = new ApplicationTest(canvas);
app.update(0, 0);
app.render();
console.log(app);
const startBtn: HTMLButtonElement = document.getElementById('start') as HTMLButtonElement;
const stopBtn: HTMLButtonElement = document.getElementById('stop') as HTMLButtonElement;


startBtn.onclick = (e: MouseEvent) => {
    app.start();
}
stopBtn.onclick = (e: MouseEvent) => {
    app.stop();
}