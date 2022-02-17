import { BezierEnumerator, IBezierEnumerator } from "./QuadraticBezierCurve";

const PiBy180: number = 0.017453292519943295; // Math.PI / 180.0
const EPSILON: number = 0.00001;
export class v2 {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class vec2 {
    // 使用float32Array强类型数组，不需要进行引用类型到值类型，以及值类型到引用类型的转换，效率比较高
    public values: Float32Array;
    // 由于这几个向量比较特殊，所以实现为公开访问级别的静态成员变量
    public static xAxis = new vec2(1, 0);
    public static yAxis = new vec2(0, 1);
    public static nXAxis = new vec2(-1, 0);
    public static nYAxis = new vec2(0, -1);
    constructor(x: number = 0, y: number = 0) {
        this.values = new Float32Array([x, y]);
    }
    get x(): number {
        return this.values[0];
    }
    set x(x: number) {
        this.values[0] = x;
    }
    get y(): number {
        return this.values[1];
    }
    set y(y: number) {
        this.values[1] = y;
    }
    // 获取没有开根号的向量大小
    get squaredLength(): number {
        const [x, y] = this.values;
        return x ** 2 + y ** 2;
    }
    get length(): number {
        return Math.sqrt(this.squaredLength);
    }
    add(right: vec2): vec2 {
        // 不需要重新分配内存空间，效率相对较高
        vec2.sum(this, right, this);
        return this;
    }
    substarct(another: vec2): vec2 {
        vec2.difference(this, another, this);
        return this;
    }
    // 内积
    innerProduct(right: vec2): number {
        return vec2.dotProduct(this, right);
    }
    // 得到一个和原向量方向相反，大小相同的向量，会改变原向量
    negative(): vec2 {
        this.values[0] = -this.values[0];
        this.values[1] = -this.values[1];
        return this;
    }
    // 调用本方法后会在内部修改当前向量的x和y值，修改后的向量大小为1.0（单位向量或叫方向向量），并返回未修改前向量的大小
    normalize(): number {
        // 计算出向量的大小
        let len: number = this.length;
        // 对0向量的判断与处理，长度为0，并非方向向量！! ! 
        if (Math2D.isEquals(len, 0)) {
            this.values[0] = 0;
            this.values[1] = 0;
            return 0;
        }
        // 如果已经是单位向量，直接返回1.0
        if (Math2D.isEquals(len, 1)) {
            return 1.0;
        }

        // 否则计算出单位向量（也就是方向）
        this.values[0] /= len;
        this.values[1] /= len;

        // 同时返回向量的大小
        return len;
    }
    // 为了避免浮点数误差，使用EPSILON进行容差处理，默认情况下为0.00001
    equals(vector: vec2): boolean {
        if (Math.abs(vector.values[0] - this.values[0]) > EPSILON) return false;
        if (Math.abs(vector.values[1] - this.values[1]) > EPSILON) return false;
        return true;
    }
    // 为了重用向量，有时需要重置向量的x , y值
    reset(x: number = 0, y: number = 0): vec2 {
        this.values[0] = x;
        this.values[1] = y;
        return this;
    }
    toString() {
        return `[${this.values[0]},${this.values[1]}]`;
    }
    static create(x: number = 0, y: number = 0): vec2 {
        return new vec2(x, y);
    }
    // 复制当前的向量到result
    static copy(src: vec2, result: vec2 | null = null) {
        if (!result) result = new vec2();
        result.values[0] = src.values[0];
        result.values[1] = src.values[1];
        return result;
    }
    static sum(left: vec2, right: vec2, result: vec2 | null = null): vec2 {
        if (!result) result = new vec2();
        result.values[0] = left.values[0] + right.values[0];
        result.values[1] = left.values[1] + right.values[1];
        return result;
    }
    static difference(end: vec2, start: vec2, result: vec2 | null = null): vec2 {
        if (!result) result = new vec2();
        result.values[0] = end.values[0] - start.values[0];
        result.values[1] = end.values[1] - start.values[1];
        return result;
    }
    // 向量与标量相乘的本质是缩放向量，因此实现的静态方法名为scale。现在大家应该知道标量的英文为什么叫Scalar了，因为标量（Scalar）用来缩放（Scale）向量（Vector）。
    static scale(direction: vec2, scalar: number, result: vec2 | null = null): vec2 {
        if (!result) result = new vec2();
        result.values[0] = direction.values[0] * scalar;
        result.values[1] = direction.values[1] * scalar;
        return result;
    }
    // 公开静态方法scaleAdd是一个非常重要的操作，其公式为：result = start + direction × scalar，作用是将一个点（start），沿着direction给定的方向，移动scalar个单位。
    static scaleAdd(start: vec2, direction: vec2, scalar: number, result: vec2 | null = null): vec2 {
        if (!result) result = new vec2();
        // result中存储的是缩放后的向量
        vec2.scale(direction, scalar, result);
        // start + result = result，然后将result返回给调用者
        return vec2.sum(start, result, result);
    }
    // 点积，两个向量的点乘就是对应分量的乘积的和，其返回的结果是一个标量（number类型），结果大于 0 表示锐角，正相关；等于 0 就是直角，小于 0 就是钝角，负相关；一般用来判断垂直和投影
    static dotProduct(left: vec2, right: vec2): number {
        return left.values[0] * right.values[0] + left.values[1] * right.values[1];
    }
    // 叉乘：两个向量叉乘的模长的几何意义是该两个向量所围成的平行四边形的面积，叉乘的结果其实是个向量，暂时理解为标量
    // A x B = |A||B|Sin(θ)，然而角度 θ和上面点乘的角度有一点点不同，他是有正负的，是指从A到B的角度
    static crossProduct(left: vec2, right: vec2): number {
        return left.x * right.y - left.y * right.x;
    }
    // 用来计算两向量之间的夹角 cosθ = a·b / ( || a || || b || )，getAngle返回的是相对方向，由于其取值范围，无法确定角度的旋转方向（是逆时针旋转还是顺时针旋转）。
    static getAngle(a: vec2, b: vec2, isRadian: boolean = false): number {
        // getAngle方法内部使用Math类的acos方法，acos方法返回的是两个向量之间的夹角，其返回值的取值范围为[ 0, Math.PI ]。
        const radian = Math.acos(vec2.dotProduct(a, b) / (a.length * b.length))
        if (isRadian) return radian;
        return Math2D.toDegree(radian);
    }
    // 用来表示物体朝向，需要与夹角区分，可以将getOrientation看作绝对方向的表示，能唯一地确定物体的方向。
    static getOrientation(from: vec2, to: vec2, isRadian: boolean = false): number {
        // atan2 方法返回的总是与x轴正方向向量之间的夹角，其取值范围为[ -Math.PI , Math.PI ]之间。
        const diff = vec2.difference(to, from);
        const radian = Math.atan2(diff.y, diff.x);
        if (isRadian) return radian;
        return Math2D.toDegree(radian);
    }
    /**
     * sin(a) = || a⊗ b || = a.x * b.y - b.x * a.y
     * @param a 
     * @param b 
     * @param norm 
     * @returns 
     */
    static sinAngle(a: vec2, b: vec2, norm: boolean = false): number {
        if (norm) {
            a.normalize();
            b.normalize();
        }
        return (a.x * b.y - b.x * a.y);
    }
    /**
     * cos(a) = a · b = a.x * b.x + a.y * b.y
     * @param a 
     * @param b 
     * @param norm 
     * @returns 
     */
    static cosAngle(a: vec2, b: vec2, norm: boolean = false): number {
        if (norm) {
            a.normalize();
            b.normalize();
        }
        return vec2.dotProduct(a, b);
    }
}

export class Size {
    public values: Float32Array;
    constructor(width: number = 1, height: number = 1) {
        this.values = new Float32Array([width, height]);
    }
    get width(): number {
        return this.values[0];
    }
    set width(width: number) {
        this.values[0] = width;
    }
    get height(): number {
        return this.values[1];
    }
    set height(height: number) {
        this.values[1] = height;
    }
    static create(width: number = 1, height: number = 1) {
        return new Size(width, height);
    }
}

export class Rectangle {
    public origin: vec2;
    public size: Size;
    constructor(origin: vec2 = new vec2(), size: Size = new Size()) {
        this.origin = origin;
        this.size = size;
    }
    static create(x: number, y: number, width: number, height: number) {
        return new Rectangle(new vec2(x, y), new Size(width, height));
    }
}

/**
 * 矩阵并没有使用3×3数组来表示，而是使用了六个浮点数组成的强类型数组，因为3×3仿射变换矩阵的最后一行总是为[0 , 0 , 1]，因此不需要多浪费三个浮点数来存储这三个常量。
 */
export class mat2d {
    public values: Float32Array;
    /**
     * 矩阵默认初始值也是单位矩阵
     */
    constructor(a: number = 1, b: number = 0, c: number = 0, d: number = 1, x: number = 0, y: number = 0) {
        this.values = new Float32Array([a, b, c, d, x, y]);
    }
    /**
     * 将矩阵重置为单位矩阵
     */
    identity() {
        this.values[0] = 1.0;
        this.values[1] = 0.0;
        this.values[2] = 0.0;
        this.values[3] = 1.0;
        this.values[4] = 0.0;
        this.values[5] = 0.0;
    }
    static create(a: number = 1, b: number = 0, c: number = 0, d: number = 1, x: number = 0, y: number = 0): mat2d {
        return new mat2d(a, b, c, d, x, y);
    }
    static copy(origin: mat2d, result: mat2d | null = null) {
        if (!result) result = mat2d.create();
        const a: number = origin.values[0];
        const b: number = origin.values[1];
        const c: number = origin.values[2];
        const d: number = origin.values[3];
        const x: number = origin.values[4];
        const y: number = origin.values[5];

        result.values[0] = a;
        result.values[1] = b;
        result.values[2] = c;
        result.values[3] = d;
        result.values[4] = x;
        result.values[5] = y;
        return result;
    }
    // 矩阵乘法不符合交换律，即A×B≠B×A，因此在进行矩阵乘法运算时必须要一直注意乘法的顺序。
    // 矩阵还有加法、减法、矩阵与标量相乘运算等，由于这些运算在图形或游戏中基本不会用到，因此忽略这些操作。
    static multiply(left: mat2d, right: mat2d, result: mat2d | null = null): mat2d {
        if (!result) result = new mat2d();
        let a0: number = left.values[0];
        let a1: number = left.values[1];
        let a2: number = left.values[2];
        let a3: number = left.values[3];
        let a4: number = left.values[4];
        let a5: number = left.values[5];

        let b0: number = right.values[0];
        let b1: number = right.values[1];
        let b2: number = right.values[2];
        let b3: number = right.values[3];
        let b4: number = right.values[4];
        let b5: number = right.values[5];

        // 参考上面矩阵乘法的结果
        result.values[0] = a0 * b0 + a2 * b1;
        result.values[1] = a1 * b0 + a3 * b1;
        result.values[2] = a0 * b2 + a2 * b3;
        result.values[3] = a1 * b2 + a3 * b3;
        result.values[4] = a0 * b4 + a2 * b5 + a4;
        result.values[5] = a1 * b4 + a3 * b5 + a5;

        return result;
    }
    /**
     * 计算矩阵的行列式
     * @param mat 
     * @returns 
     */
    // 计算矩阵的行列式
    static determinant(mat: mat2d): number {
        return mat.values[0] * mat.values[3] - mat.values[2] * mat.values[1];
    }
    /**
     * 求矩阵src的逆矩阵，将结算后的逆矩阵从result参数中输出，下面的代码中使用：伴随矩阵 / 行列式 的方式来求矩阵的逆
     * 优点：通用省心，适合所有情况。
     * 缺点：计算量稍微大一些。
     * @param src 
     * @param result 
     * @returns 如果有逆矩阵，返回true；否则返回false
     */
    static invert(src: mat2d, result: mat2d): boolean {
        // 1. 获取要求逆的矩阵的行列式
        let det: number = mat2d.determinant(src);
        // 2. 如果行列式为0，则无法求逆，直接返回false
        if (Math2D.isEquals(det, 0)) return false;
        // 3. 使用：伴随矩阵 / 行列式 的算法来求矩阵的逆
        // 由于计算机中除法效率较低，先进行一次除法，求行列式的倒数
        // 后面代码就可以直接乘以行列式的倒数，这样避免了多次除法操作
        det = 1.0 / det;
        // 4. 下面的代码中，* det之前的代码都是求标准伴随矩阵的源码
        //    最后乘以行列式的倒数，获得每个元素的正确数值
        result.values[0] = src.values[3] * det;
        result.values[1] = -src.values[1] * det;
        result.values[2] = -src.values[2] * det;
        result.values[3] = src.values[0] * det;
        result.values[4] = (src.values[2] * src.values[5] - src.values[3] * src.values[4]) * det;
        result.values[5] = (src.values[1] * src.values[4] - src.values[0] * src.values[5]) * det;
        // 如果矩阵求逆成功，返回true
        return true;
    }
    /**
     * 平移矩阵
     * @param tx 
     * @param ty 
     * @param result 
     * @returns 
     */
    static makeTranslation(tx: number, ty: number, result: mat2d | null = null): mat2d {
        if (!result) result = new mat2d();
        result.values[0] = 1;
        result.values[1] = 0;
        result.values[2] = 0;
        result.values[3] = 1;
        // 会看到平移矩阵只需要设置第4个和第5个元素的值
        result.values[4] = tx;
        result.values[5] = ty;
        return result;
    }
    /**
     * 缩放矩阵
     * @param sx 
     * @param sy 
     * @param result 
     * @returns 
     */
    static makeScale(sx: number, sy: number, result: mat2d | null = null): mat2d {
        if (Math2D.isEquals(sx, 0) || Math2D.isEquals(sy, 0)) {
            alert(" x轴或y轴缩放系数为0 ");
            throw new Error(" x轴或y轴缩放系数为0 ");
        }
        if (!result) result = new mat2d();
        result.values[0] = sx;
        result.values[1] = 0;
        result.values[2] = 0;
        result.values[3] = sy;
        result.values[4] = 0;
        result.values[5] = 0;
        return result;
    }
    /**
     * 旋转矩阵
     * @param radians 弧度
     * @param result 
     * @returns 
     */
    static makeRotation(radians: number, result: mat2d | null = null): mat2d {
        if (!result) result = new mat2d();
        let s: number = Math.sin(radians), c: number = Math.cos(radians);
        result.values[0] = c;
        result.values[1] = s;
        result.values[2] = -s;
        result.values[3] = c;
        result.values[4] = 0;
        result.values[5] = 0;
        return result;
    }
    // 会修改this指向的数据
    /**
     * 仅适用于旋转矩阵的逆矩阵
     * @returns 
     */
    onlyRotationMatrixInvert(): mat2d {
        let s: number = this.values[1];
        // 矩阵的第1个元素和第2个元素值交换
        this.values[1] = this.values[2];
        this.values[2] = s;
        return this;
    }
    /**
     * 两个单位向量构造旋转矩阵
     * @param v1 
     * @param v2 
     * @param norm 指明是否要normlize两个向量
     * @param result 
     * @returns 
     */
    public static makeRotationFromVectors(v1: vec2, v2: vec2, norm: boolean = false, result: mat2d | null = null): mat2d {
        if (!result) result = new mat2d();
        result.values[0] = vec2.cosAngle(v1, v2, norm);
        result.values[1] = vec2.sinAngle(v1, v2, norm);
        result.values[2] = -vec2.sinAngle(v1, v2, norm);
        result.values[3] = vec2.cosAngle(v1, v2, norm);
        result.values[4] = 0;
        result.values[5] = 0;
        return result;
    }
}

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

export class Math2D {
    public static matStack: MatrixStack = new MatrixStack();
    static random(from: number, to: number): number {
		return Math.random() * to + from;
	}
    // 将以角度表示的参数转换为弧度表示
    static toRadian(degree: number): number {
        return degree * PiBy180;
    }
    // 将以弧度表示的参数转换为角度表示
    static toDegree(radian: number): number {
        return radian / PiBy180;
    }
    static isEquals(value1: number, value2: number) {
        return value1 === value2;
    }
    /**
     * 计算三角形两条边向量的叉积，用于判断三角形的顶点顺序
     * @param v0 三角形的顶点
     * @param v1 三角形的顶点
     * @param v2 三角形的顶点
     */
    static sign(v0: vec2, v1: vec2, v2: vec2): number {
        const e1: vec2 = vec2.difference(v0, v2);
        const e2: vec2 = vec2.difference(v1, v2);
        return vec2.crossProduct(e1, e2);
    }
    // 将一个点pt投影到start和end形成的线段上：先把原向量转换成单位向量，这样向量的点积就是投影长度
    // 返回值：true表示pt在线段起点和终点之间，此时closePoint输出参数返回线段上的投影点坐标
    //      false表示在线段起点或终点之外，此时closePoint输出参数返回线段的起点或终点
    // 本方法使用了向量的difference、normalize、dotProduct、scaleAdd（scale和sum）方法
    static projectPointOnLineSegment(pt: vec2, start: vec2, end: vec2, closePoint: vec2): boolean {
        // 向量的create方法
        let v0: vec2 = vec2.create();
        let v1: vec2 = vec2.create();
        let d: number = 0;
        // 向量减法，形成方向向量
        vec2.difference(pt, start, v0);
        // 线段的起点到某个点（例如鼠标位置点）的方向向量
        vec2.difference(end, start, v1);
        // 获取线段
        // 使用向量的normalize方法，原向量变成单位向量，并返回原向量的长度
        // 需要注意的是，normalize起点到终点线段形成的向量
        // 要投影到哪个向量，就要将这个向量normalize成单位向量
        d = v1.normalize();
        // 将v0投影在v1上，获取投影长度t；这是根据 cosθ = a·b / ( || a || || b || ) 公式来计算的，此时 b 向量为单位向量，长度为 1，所以 a·b = || a ||cosθ = 几何意义就是投影长度
        let t: number = vec2.dotProduct(v0, v1);
        // 如果投影长度t < 0，说明鼠标位置点在线段的起点范围之外
        // 处理的方式是：
        // closePt输出线段起点并且返回false
        if (t < 0) {
            closePoint.x = start.x;
            closePoint.y = start.y;
            return false;
        } else if (t > d) {// 如果投影长度 > 线段的长度，说明鼠标位置点超过线段终点范围
            // closePt输出线段起点并且返回false
            closePoint.x = end.x;
            closePoint.y = end.y;
            return false;
        } else {
            // 说明鼠标位置点位于线段起点和终点之间
            // 使用scaleAdd方法计算出相对全局坐标（左上角）的坐标偏移信息
            // 只有此时才返回true
            vec2.scaleAdd(start, v1, t, closePoint);
            return true;
        }
    }
    static isPointInCircle(pt: vec2, center: vec2, radius: number): boolean {
        const diff: vec2 = vec2.difference(pt, center);
        // 避免使用 Math.sqrt 方法
        return diff.squaredLength <= radius ** 2;
    }
    /**
     * 判断点是否在线段上：先判断点的投影是否在线上 + 再判断点和投影点之间的距离是否在一定范围内
     * @param pt 点
     * @param start 线段起点
     * @param end 线段终点
     * @param closePt 投影点
     * @param radius 误差半径
     * @returns 点是否在线段上
     */
    static isPointOnLineSegment(pt: vec2, start: vec2, end: vec2, closePt: vec2 = vec2.create(), radius: number = EPSILON): boolean {
        const isIn = Math2D.projectPointOnLineSegment(pt, start, end, closePt);
        if (!isIn) return false;
        return Math2D.isPointInCircle(pt, closePt, radius);
    }
    static isPointInRect(ptX: number, ptY: number, x: number, y: number, width: number, height: number): boolean {
        return ptX >= x && ptX <= x + width && ptY >= y && ptY <= y + height;
    }
    static isPointInEllipse(ptX: number, ptY: number, centerX: number, centerY: number, radiusX: number, radiusY: number): boolean {
        const diffX = ptX - centerX;
        const diffY = ptY - centerY;
        return diffX ** 2 / radiusX ** 2 + diffY ** 2 / radiusY ** 2 <= 1.0;
    }
    /**
     * 点是否在三角形内部
     * 方法一：如果 pt 与三角形的三个顶点连线形成的三个三角形的顶点方向一致，则 pt 在三角形内部
     * 方法二：面积法，如果点 pt 在三角形内部，则 pt 与三角形顶点分割成的三个三角形的面积之和等于三角形的面积。三角形的面积就等于叉乘模长的一半
     * 方法三：内角和为 180°，效率低不管它
     * @param pt 点
     * @param v0 三角形顶点
     * @param v1 三角形顶点
     * @param v2 三角形顶点
     * @returns 
     */
    static isPointInTriangle(pt: vec2, v0: vec2, v1: vec2, v2: vec2): boolean {
        // 三角形三条边的方向都一致就说明点在三角形内部
        const b1: boolean = Math2D.sign(v0, v1, pt) < 0.0;
        const b2: boolean = Math2D.sign(v1, v2, pt) < 0.0;
        const b3: boolean = Math2D.sign(v2, v0, pt) < 0.0;
        return (b1 === b2) && (b2 === b3);
    }
    static isPointInPolygon(pt: vec2, points: vec2[]): boolean {
        // 凸多边形至少三条边
        if (points.length < 3) return false;
        // 以 points[0] 为共享点遍历凸多边形顶点
        for (let i = 2; i < points.length; i++) {
            if (Math2D.isPointInTriangle(pt, points[0], points[i - 1], points[i])) return true;
        }
        return false;
    }
    /**
     * 判断是否为凸多边形：分割成三角形，每个三角形顶点顺序一致
     * @param points 顶点数组，全部顺时针或全部逆时针
     * @returns 
     */
    static isConvex(points: vec2[]): boolean {
        const firstSign = Math2D.sign(points[0], points[1], points[2]) < 0;
        let j: number;
        let k: number;
        for (let i = 1; i < points.length; i++) {
            j = (i + 1) % points.length;
            k = (i + 2) % points.length;
            if (firstSign !== Math2D.sign(points[i], points[j], points[k]) < 0) return false;
        }
        return true;
    }
    /**
     * 矩阵和向量相乘
     * @param mat 
     * @param pt 
     * @param result 
     * @returns 
     */
    static transform(mat: mat2d, pt: vec2, result: vec2 | null = null): vec2 {
        if (!result) result = vec2.create();
        result.values[0] = mat.values[0] * pt.values[0] + mat.values[2] * pt.values[1] + mat.values[4];
        result.values[1] = mat.values[1] * pt.values[0] + mat.values[3] * pt.values[1] + mat.values[5];
        return result;
    }
    /**
     * 二次贝塞尔曲线标量版
     * B(t) = (1 - t)^2 * P0 + 2t * (1 - t) * P1 + t^2 * P2, t ∈ [0,1]
     * @param start 
     * @param ctrl 
     * @param end 
     * @param t 
     * @returns 
     */
    static getQuadraticBezierPosition(start: number, ctrl: number, end: number, t: number): number {
        if (t < 0.0 || t > 1.0) {
            alert(" t的取值范围必须为[ 0 , 1 ] ");
            throw new Error(" t的取值范围必须为[ 0 , 1 ] ");
        }
        let t1: number = 1.0 - t;
        let t2: number = t1 * t1;
        return t2 * start + 2.0 * t * t1 * ctrl + t * t * end;
    }
    /**
     * 二次贝塞尔曲线向量版
     * B(t) = (1 - t)^2 * P0 + 2t * (1 - t) * P1 + t^2 * P2, t ∈ [0,1]
     * @param start 
     * @param ctrl 
     * @param end 
     * @param t 
     * @param result 
     * @returns 
     */
    static getQuadraticBezierVector(start: vec2, ctrl: vec2, end: vec2, t: number, result: vec2 | null = null): vec2 {
        if (result === null) result = vec2.create();
        result.x = Math2D.getQuadraticBezierPosition(start.x, ctrl.x, end.x, t);
        result.y = Math2D.getQuadraticBezierPosition(start.y, ctrl.y, end.y, t);
        return result;
    }
    /**
     * 三次贝塞尔曲线标量版
     * B(t) = P0 * (1-t)^3 + 3 * P1 * t * (1-t)^2 + 3 * P2 * t^2 * (1-t) + P3 * t^3, t ∈ [0,1]
     * @param start 
     * @param ctrl0 
     * @param ctrl1 
     * @param end 
     * @param t 
     * @returns 
     */
    static getCubicBezierPosition(start: number, ctrl0: number, ctrl1: number, end: number, t: number): number {
        if (t < 0.0 || t > 1.0) {
            alert(" t的取值范围必须为[ 0 , 1 ] ");
            throw new Error(" t的取值范围必须为[ 0 , 1 ] ");
        }
        let t1: number = (1.0 - t);
        let t2: number = t * t;
        let t3: number = t2 * t;
        return (t1 * t1 * t1) * start + 3 * t * (t1 * t1) * ctrl0 + (3 * t2 * t1) * ctrl1 + t3 * end;
    }
    /**
     * 三次贝塞尔曲线向量版
     * B(t) = P0 * (1-t)^3 + 3 * P1 * t * (1-t)^2 + 3 * P2 * t^2 * (1-t) + P3 * t^3, t ∈ [0,1]
     * @param start 
     * @param ctrl0 
     * @param ctrl1 
     * @param end 
     * @param t 
     * @param result 
     * @returns 
     */
    static getCubicBezierVector(start: vec2, ctrl0: vec2, ctrl1: vec2, end: vec2, t: number, result: vec2 | null = null): vec2 {
        if (result === null) result = vec2.create();
        result.x = Math2D.getCubicBezierPosition(start.x, ctrl0.x, ctrl1.x, end.x, t);
        result.y = Math2D.getCubicBezierPosition(start.y, ctrl0.y, ctrl1.y, end.y, t);
        return result;
    }
    // 实现创建贝塞尔迭代器接口的工厂方法
    static createQuadraticBezierEnumerator(start: vec2, ctrl: vec2, end: vec2, steps: number = 30): IBezierEnumerator {
        return new BezierEnumerator(start, end, ctrl, null, steps);
    }
    static createCubicBezierEnumerator(start: vec2, ctrl0: vec2, ctrl1: vec2, end: vec2, steps: number = 30): IBezierEnumerator {
        return new BezierEnumerator(start, end, ctrl0, ctrl1, steps);
    }
}
export class Transform2D {
    // 位移
    public position: vec2;
    //方位（角度表示）
    public rotation: number;
    // 缩放
    public scale: vec2;
    public constructor(x: number = 0, y: number = 0, rotation: number = 0, scaleX: number = 1, scaleY: number = 1) {
        this.position = new vec2(x, y);
        this.rotation = rotation;
        this.scale = new vec2(scaleX, scaleY);
    }
    public toMatrix(): mat2d {
        // 设置矩阵栈顶矩阵归一化
        Math2D.matStack.loadIdentity();
        // 先平移
        Math2D.matStack.translate(this.position.x, this.position.y);
        // 然后旋转，最后一个参数false，表示rotation是角度而不是弧度
        Math2D.matStack.rotate(this.rotation, false);
        //最后缩放操作
        Math2D.matStack.scale(this.scale.x, this.scale.y);
        // 返回TRS合成后的、表示从局部到世界的变换矩阵
        return Math2D.matStack.matrix;
    }
    public toInvMatrix(result: mat2d): boolean {
        // 获取局部到世界的变换矩阵
        let mat: mat2d = this.toMatrix();
        // 对mat矩阵求逆，获得从世界到局部的变换矩阵
        return mat2d.invert(mat, result);
    }
}