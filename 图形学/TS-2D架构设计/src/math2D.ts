export class v2 {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class vec2 {
    public values: Float32Array;
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
    toString() {
        return `[${this.values[0]},${this.values[1]}]`;
    }
    static create(x: number = 0, y: number = 0) {
        return new vec2(x, y);
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