import { CanvasMouseEvent, CanvasKeyboardEvent } from '../src/CnavasInputEvent';
import { Math2D, v2, vec2, mat2d } from '../src/math2D';
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

    // 用向量来表示
    public pos: vec2 = new vec2(100, 100);
    public target: vec2 = new vec2();

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
        this.target.values[0] = e.canvasPos.x;
        this.target.values[1] = e.canvasPos.y;
        this._lookAt();
    }
    private _lookAt() {
        const radian = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.tankRotation = radian;
    }
    // 通过三角函数来实现移动
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
    // 通过向量来实现移动，在向量标量相乘版本的朝向运动代码中，没有任何耗时的三角函数操作，全部都是标量（一个二维向量由两个标量组成）的加法、减法，以及乘法操作。
    private _moveToByVector(dt: number) {
        const dir = vec2.difference(this.target, this.pos);
        dir.normalize();
        // 将坦克沿着单位方向 dir 移动 this.linearSpeed * dt 个单位
        this.pos = vec2.scaleAdd(this.pos, dir, this.linearSpeed * dt);
        this.x = this.pos.values[0];
        this.y = this.pos.values[1];
    }
    update(dt: number) {
        // this._moveTo(dt);
        this._moveToByVector(dt);
    }
}

/**
 * 如果用矩阵来写坦克，大致如下
 */
export class TankWithMatrix {
    // 坦克当前的位置
    public pos: vec2 = new vec2(100, 100);
    // 坦克当前的x和y方向上的缩放系数
    public scale: vec2 = new vec2(1, 1);
    // 坦克当前的旋转角度，使用旋转矩阵表示
    public tankRotation: mat2d = new mat2d();
    public target: vec2 = new vec2();
    public initYAxis: boolean = false;
    public linearSpeed: number = 0.1;
    public x: number = 100;
    public y: number = 100;
    // 其他成员变量与原来Tank类一样，不再列出

    draw(app: TestApplication) {
        const ctx2D: CanvasRenderingContext2D | null = app.ctx2D;
        if (!ctx2D) return;
        // ...省略
        // 整个坦克移动和旋转，注意局部变换的经典结合顺序（trs:translate -> rotate -> scale )
        // 原本是app.ctx2D.translate ( 弧度 )，现在改成如下调用方式
        ctx2D.translate(this.pos.x, this.pos.y);
        // tankRotation目前不是弧度表示，而是旋转矩阵
        app.transform(this.tankRotation);
        ctx2D.scale(this.scale.x, this.scale.y);
        // ...省略
    }
    private _lookAt() {
        const v = vec2.difference(this.target, this.pos);
        v.normalize();
        // 注意下面旋转的角度是从 x 轴到 v
        this.tankRotation = mat2d.makeRotationFromVectors(vec2.xAxis, v);

        // 如果是从 v 到 x 轴则组要这样写
        // this.tankRotation = mat2d.makeRotationFromVectors(v, vec2.xAxis);
        // // 将求得tankRotation旋转矩阵后使用通用的invert方法获得逆矩阵，不然方向不正确，下面两行代码都可以
        // this.tankRotation.onlyRotationMatrixInvert();
        // // mat2d.invert(this.tankRotation, this.tankRotation);
    }
    // 通过向量来实现移动，在向量标量相乘版本的朝向运动代码中，没有任何耗时的三角函数操作，全部都是标量（一个二维向量由两个标量组成）的加法、减法，以及乘法操作。
    private _moveToByVector(dt: number) {
        const dir = vec2.difference(this.target, this.pos);
        dir.normalize();
        // 将坦克沿着单位方向 dir 移动 this.linearSpeed * dt 个单位
        this.pos = vec2.scaleAdd(this.pos, dir, this.linearSpeed * dt);
        this.x = this.pos.values[0];
        this.y = this.pos.values[1];
    }
}