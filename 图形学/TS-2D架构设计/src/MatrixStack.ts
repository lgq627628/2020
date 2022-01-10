import { mat2d, vec2, Math2D } from "./math2D";

export class MatrixStack {
    // 持有一个矩阵堆栈
    private _mats: mat2d[];
    // 构造函数
    constructor() {
        // 初始化矩阵堆栈后push一个单位矩阵
        this._mats = [];
        this._mats.push(new mat2d());
    }
    // 获取栈顶的矩阵（也就是当前操作矩阵）
    // 矩阵堆栈操作的都是当前堆栈顶部的矩阵
    get matrix(): mat2d {
        if (this._mats.length === 0) {
            alert(" 矩阵堆栈为空 ");
            throw new Error(" 矩阵堆栈为空 ");
        }
        return this._mats[this._mats.length - 1];
    }
    // 复制栈顶的矩阵，将其push到堆栈中成为当前操作矩阵
    pushMatrix(): void {
        let mat: mat2d = mat2d.copy(this.matrix);
        this._mats.push(mat);
    }
    // 删除栈顶的矩阵
    popMatrix(): void {
        if (this._mats.length === 0) {
            alert(" 矩阵堆栈为空 ");
            return;
        }
        this._mats.pop();
    }
    // 将堆栈顶部的矩阵设置为单位矩阵
    loadIdentity(): void {
        this.matrix.identity();
    }
    // 将参数mat矩阵替换堆栈顶部的矩阵
    loadMatrix(mat: mat2d): void {
        mat2d.copy(mat, this.matrix);
    }
    // 将栈顶（当前矩阵）矩阵与参数矩阵相乘
    // 其作用是更新栈顶元素，累积变换效果
    // 是一个关键操作
    multMatrix(mat: mat2d): void {
        mat2d.multiply(this.matrix, mat, this.matrix);
    }
    translate(x: number = 0, y: number = 0): void {
        let mat: mat2d = mat2d.makeTranslation(x, y);
        // 看到translate、rotate和scale都会调用multMatrix方法
        this.multMatrix(mat);
    }
    rotate(angle: number = 0, isRadian: boolean = true): void {
        if (isRadian === false) {
            angle = Math2D.toRadian(angle);
        }
        let mat: mat2d = mat2d.makeRotation(angle);
        this.multMatrix(mat);
    }
    // 从两个向量构建旋转矩阵
    rotateFrom(v1: vec2, v2: vec2, norm: boolean = false): void {
        let mat: mat2d = mat2d.makeRotationFromVectors(v1, v2, norm);
        this.multMatrix(mat);
    }
    scale(x: number = 1.0, y: number = 1.0): void {
        let mat: mat2d = mat2d.makeScale(x, y);
        this.multMatrix(mat);
    }
    invert(): mat2d {
        let ret: mat2d = new mat2d();
        if (mat2d.invert(this.matrix, ret) === false) {
            alert(" 堆栈顶部矩阵为奇异矩阵，无法求逆 ");
            throw new Error(" 堆栈顶部矩阵为奇异矩阵，无法求逆 ");
        }
        return ret;
    }
}