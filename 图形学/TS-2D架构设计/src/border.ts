import { Math2D, vec2 } from './math2D';

export class Size {
	public values: Float32Array;
	constructor(w: number = 1, h: number = 1) {
		this.values = new Float32Array([w, h]); //
	}

	public set width(value: number) {
		this.values[0] = value;
	}
	public get width(): number {
		return this.values[0];
	}

	public set height(value: number) {
		this.values[1] = value;
	}
	public get height(): number {
		return this.values[1];
	}

	public static create(w: number = 1, h: number = 1): Size {
		return new Size(w, h);
	}
}

// 矩形包围框
export class Rectangle {
	public origin: vec2;
	public size: Size;
	public constructor(origin: vec2 = new vec2(), size: Size = new Size(1, 1)) {
		this.origin = origin;
		this.size = size;
	}

	public static create(x: number = 0, y: number = 0, w: number = 1, h: number = 1): Rectangle {
		let origin: vec2 = new vec2(x, y);
		let size: Size = new Size(w, h);
		return new Rectangle(origin, size);
	}

	public isEmpty(): boolean {
		let area: number = this.size.width * this.size.height;
		if (Math2D.isEquals(area, 0) === true) {
			return true;
		}
		return false;
	}
}

/**
 * Inset
 */
export class Inset {
	public values: Float32Array;

	public constructor(l: number = 0, t: number = 0, r: number = 0, b: number = 0) {
		this.values = new Float32Array([l, t, r, b]);
	}

	public get leftMargin(): number {
		return this.values[0];
	}

	public set leftMargin(value: number) {
		this.values[0] = value;
	}

	public get topMargin(): number {
		return this.values[1];
	}

	public set topMargin(value: number) {
		this.values[1] = value;
	}

	public get rightMargin(): number {
		return this.values[2];
	}

	public set rightMargin(value: number) {
		this.values[2] = value;
	}

	public get bottomMargin(): number {
		return this.values[3];
	}

	public set bottomMargin(value: number) {
		this.values[3] = value;
	}
}
