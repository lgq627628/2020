const PiBy180: number = 0.017453292519943295; // Math.PI / 180.0
const EPSILON: number = 0.00001;
export class Math2D {
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
}
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
    // 点积，两个向量的点乘就是对应分量的乘积的和，其返回的结果是一个标量（number类型），结果大于 0 表示锐角，正相关；等于 0 就是直角，小于 0 就是钝角，负相关
    static dotProduct(left: vec2, right: vec2): number {
        return left.values[0] * right.values[0] + left.values[1] * right.values[1];
    }
    // 用来计算两向量之间的夹角 cosθ = a·b / ( || a || || b || )
    static getAgle(a: vec2, b: vec2, isRadian: boolean = false): number {
        const radian = Math.acos(vec2.dotProduct(a, b) / (a.length * b.length))
        if (isRadian) return radian;
        return Math2D.toDegree(radian);
    }
    // 用来表示物体朝向，需要与夹角区分
    static getOrietation(from: vec2, to: vec2, isRadian: boolean = false): number {
        const diff = vec2.difference(to, from);
        const radian = Math.atan2(diff.y, diff.x);
        if (isRadian) return radian;
        return Math2D.toDegree(radian);
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