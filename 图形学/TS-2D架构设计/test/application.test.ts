import { Application } from '../src/Application';
import { CanvasMouseEvent, CanvasKeyboardEvent } from '../src/CnavasInputEvent';

class ApplicationTest extends Application {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
    }
    protected dispatchKeyDown(e: CanvasKeyboardEvent): void {
        console.log('按下了', e.key);
    }
    protected dispatchMouseDown(e: CanvasMouseEvent): void {
        console.log('点击坐标', e.canvasPos);
    }
    update(dt: number, passingTime: number): void {
        console.log('时间间隔', dt, '流逝时间', passingTime);
    }
    render(): void {
        console.log('调用 render 方法');
    }
}

// 测试主流程
const canvas: HTMLCanvasElement | null = document.getElementById('canvas') as HTMLCanvasElement;
const app: Application = new ApplicationTest(canvas);
app.update(0, 0);
app.render();
console.log(app);
const startBtn: HTMLButtonElement = document.getElementById('start') as HTMLButtonElement;
const stopBtn: HTMLButtonElement = document.getElementById('stop') as HTMLButtonElement;

// 测试定时器
function timerCallback(id: number, data: any) {
    console.log('定时器执行回调：', data);
}
app.addTimer(timerCallback, 1000, false, '回调传的数据');


startBtn.addEventListener('click', (e: MouseEvent) => {
    app.start();
});
stopBtn.addEventListener('click', (e: MouseEvent) => {
    app.stop();
});

