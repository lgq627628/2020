import { CanvasMouseEvent, CanvasKeyboardEvent } from '../src/CnavasInputEvent';
import { Math2D } from '../src/math2D';
import { TestApplication } from './draw.test';
export class Tank {
    public x: number = 100;
    public y: number = 100;
    public width: number = 80;
    public height: number = 50;
    // 坦克当前的x和y方向上的缩放系数
    public scaleX: number = 1.0;
    public scaleY: number = 1.0;
    // 坦克旋转角度，单位弧度
    public tankRotation: number = 0;
    // 坦克上炮塔的旋转角度，单位弧度
    public turretRotation: number = 0;
    // 是否显示坦克中心和画布中心的连线
    public showLine: boolean = false;
    // 是否显示坦克自身局部坐标系
    public showCoord: boolean = false;
    // 炮管长度
    public gunLength: number = Math.max(this.width, this.height);
    // 炮口大小
    public gunMuzzleRadius: number = 5;
    // 在Tank类中增加一个成员变量，用来标示Tank初始化时是否朝着y轴正方向
    public initYAxis: boolean = true;
    // 要移动到的目标点，也就是鼠标点击位置
    public targetX: number = 0;
    public targetY: number = 0;
    // 速度：像素/s
    public linearSpeed: number = 0.1;
    public turretRotateSpeed: number = Math2D.toRadian(5);

    draw(app: TestApplication) {
        const ctx2D: CanvasRenderingContext2D | null = app.ctx2D;
        if (!ctx2D) return;
        ctx2D.save();
        ctx2D.save();
        // 整个坦克移动和旋转，注意局部变换的经典结合顺序（trs:translate -> rotate -> scale )
        ctx2D.translate(this.x, this.y);
        ctx2D.rotate(this.tankRotation);
        ctx2D.scale(this.scaleX, this.scaleY);
        // 绘制坦克的底盘（矩形）
        ctx2D.save();
        ctx2D.fillStyle = 'grey';
        ctx2D.beginPath();
        ctx2D.rect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);
        ctx2D.fill();
        ctx2D.restore();
        // 绘制炮塔turret，很重要的一点，炮塔作为整个坦克的一部分，是在上一级变换（trs）后的累积操作
        ctx2D.save();
        ctx2D.rotate(this.turretRotation);
        // 椭圆炮塔ellipse方法
        ctx2D.fillStyle = 'red';
        ctx2D.beginPath();
        ctx2D.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
        ctx2D.fill();
        // 炮管gun barrel
        ctx2D.strokeStyle = 'blue';
        ctx2D.lineWidth = 5;
        //炮管需要粗一点，因此为5个单位
        ctx2D.lineCap = 'round';     // 使用round方式
        ctx2D.beginPath();
        ctx2D.moveTo(0, 0);
        ctx2D.lineTo(this.gunLength, 0);
        ctx2D.stroke();
        // 炮口，先将局部坐标系从当前的方向，向x轴的正方向平移gunLength（数值类型的变量，以像素为单位，表示炮管的长度）个像素，此时局部坐标系在炮管最右侧
        ctx2D.translate(this.gunLength, 0);
        // 然后再从当前的坐标系向x轴的正方向平移gunMuzzleRadius（数值类型的变量，以像素为单位，表示炮管的半径）个像素，这样炮口的外切圆正好和炮管相接触
        ctx2D.translate(this.gunMuzzleRadius, 0);
        // 调用自己实现的fillCircle方法，内部使用Canvas2D arc绘制圆弧方法
        app.fillCircle(0, 0, 5, 'black');
        ctx2D.restore();
        // 绘制一个圆球，标记坦克正方向，一旦炮管旋转后，可以知道正前方在哪里
        ctx2D.save();
        ctx2D.translate(this.width * 0.5, 0);
        app.fillCircle(0, 0, 10, 'green');
        ctx2D.restore();
        // 坐标系是跟随整个坦克的
        if (this.showCoord) {
            ctx2D.save();
            ctx2D.lineWidth = 1;
            ctx2D.lineCap = 'butt';
            app.strokeCoord(0, 0, this.width * 1.2, this.height * 1.2);
            ctx2D.restore();
        }
        ctx2D.restore();
        // 画中心点连线
        ctx2D.save();
        app.strokeLine(this.x, this.y, app.canvas.width / 2, ctx2D.canvas.height / 2);
        app.strokeLine(this.x, this.y, this.targetX, this.targetY);
        ctx2D.restore();
    }

    onKeyPress(e: CanvasKeyboardEvent) {
        if (e.key === 'd') {
            this.turretRotation += this.turretRotateSpeed;
        } else if (e.key === 'a') {
            this.turretRotation -= this.turretRotateSpeed;
        } else if (e.key === 's') {
            this.turretRotation = 0;
        }
    }
    onMouseMove(e: CanvasMouseEvent) {
        this.targetX = e.canvasPos.x;
        this.targetY = e.canvasPos.y;
        this._lookAt();
    }
    private _lookAt() {
        const radian = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.tankRotation = radian;
    }
    private _moveTo(dt: number) {
        const diffX: number = this.targetX - this.x;
        const diffY: number = this.targetY - this.y;
        const curSpeed: number = this.linearSpeed * dt;
        if (diffX * diffX + diffY * diffY > curSpeed * curSpeed) {
            this.x += curSpeed * Math.cos(this.tankRotation);
            this.y += curSpeed * Math.sin(this.tankRotation);
            // this.x += this.linearSpeed * dt * Math.cos(this.tankRotation);
            // this.y += this.linearSpeed * dt * Math.sin(this.tankRotation);
        }
    }
    update(dt: number) {
        this._moveTo(dt);
    }
}