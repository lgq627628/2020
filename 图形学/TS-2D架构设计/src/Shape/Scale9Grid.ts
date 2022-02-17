import { Inset, Rectangle, Size } from '../border';
import { vec2 } from '../math2D';
import { EImageFillType, IRenderState, ITransformable } from '../ISprite';
import { Rect } from './Rect';

export class Scale9Data {
	public image: HTMLImageElement;

	private _inset: Inset;

	public set inset(value: Inset) {
		this._inset = value;
	}

	public get leftMargin(): number {
		return this._inset.leftMargin;
	}

	public get rightMargin(): number {
		return this._inset.rightMargin;
	}

	public get topMargin(): number {
		return this._inset.topMargin;
	}

	public get bottomMargin(): number {
		return this._inset.bottomMargin;
	}

	public constructor(image: HTMLImageElement, inset: Inset) {
		this.image = image;
		this._inset = inset;
	}
}

export class Scale9Grid extends Rect {
	public data: Scale9Data;
	public srcRects!: Rectangle[];
	public destRects!: Rectangle[];

	public get type(): string {
		return 'Scale9Grid';
	}

	public constructor(data: Scale9Data, width: number, height: number, u: number, v: number) {
		super(width, height, u, v);
		this.data = data;
		this._calcDestRects();
	}

	/**
	 * 关键方法，计算源图和目标图 9 个区域的坐标和尺寸
	 * 1、计算 4 个角 rectangle
	 * 2、计算 4 条边 rectangle
	 * 3、计算出中心 context rectangle
	 */
	private _calcDestRects(): void {
		this.destRects = [];
		this.srcRects = [];

		let rc: Rectangle;
		rc = new Rectangle();
		rc.origin = vec2.create(0, 0);
		rc.size = Size.create(this.data.leftMargin, this.data.topMargin);
		this.srcRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.x, this.y);
		rc.size = Size.create(this.data.leftMargin, this.data.topMargin);
		this.destRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.data.image.width - this.data.rightMargin, 0);
		rc.size = Size.create(this.data.rightMargin, this.data.topMargin);
		this.srcRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.right - this.data.rightMargin, this.y);
		rc.size = Size.create(this.data.rightMargin, this.data.topMargin);
		this.destRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.data.image.width - this.data.rightMargin, this.data.image.height - this.data.bottomMargin);
		rc.size = Size.create(this.data.rightMargin, this.data.bottomMargin);
		this.srcRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.right - this.data.rightMargin, this.bottom - this.data.bottomMargin);
		rc.size = Size.create(this.data.rightMargin, this.data.bottomMargin);
		this.destRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(0, this.data.image.height - this.data.bottomMargin);
		rc.size = Size.create(this.data.leftMargin, this.data.bottomMargin);
		this.srcRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.x, this.bottom - this.data.bottomMargin);
		rc.size = Size.create(this.data.leftMargin, this.data.bottomMargin);
		this.destRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(0, this.data.topMargin);
		rc.size = Size.create(this.data.leftMargin, this.data.image.height - this.data.topMargin - this.data.bottomMargin);
		this.srcRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.x, this.y + this.data.topMargin);
		rc.size = Size.create(this.data.leftMargin, this.height - this.data.topMargin - this.data.bottomMargin);
		this.destRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.data.leftMargin, 0);
		rc.size = Size.create(this.data.image.width - this.data.leftMargin - this.data.rightMargin, this.data.topMargin);
		this.srcRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.x + this.data.leftMargin, this.y);
		rc.size = Size.create(this.width - this.data.leftMargin - this.data.rightMargin, this.data.topMargin);
		this.destRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.data.image.width - this.data.rightMargin, this.data.topMargin);
		rc.size = Size.create(this.data.rightMargin, this.data.image.height - this.data.topMargin - this.data.bottomMargin);
		this.srcRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.right - this.data.rightMargin, this.y + this.data.topMargin);
		rc.size = Size.create(this.data.rightMargin, this.height - this.data.topMargin - this.data.bottomMargin);
		this.destRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.data.leftMargin, this.data.image.height - this.data.bottomMargin);
		rc.size = Size.create(this.data.image.width - this.data.leftMargin - this.data.rightMargin, this.data.bottomMargin);
		this.srcRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.x + this.data.leftMargin, this.bottom - this.data.bottomMargin);
		rc.size = Size.create(this.width - this.data.leftMargin - this.data.rightMargin, this.data.bottomMargin);
		this.destRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.data.leftMargin, this.data.topMargin);
		rc.size = Size.create(
			this.data.image.width - this.data.leftMargin - this.data.rightMargin,
			this.data.image.height - this.data.topMargin - this.data.bottomMargin,
		);
		this.srcRects.push(rc);

		rc = new Rectangle();
		rc.origin = vec2.create(this.x + this.data.leftMargin, this.y + this.data.topMargin);
		rc.size = Size.create(this.width - this.data.leftMargin - this.data.rightMargin, this.height - this.data.topMargin - this.data.bottomMargin);
		this.destRects.push(rc);
	}

	private _drawImage(
		context: CanvasRenderingContext2D,
		img: HTMLImageElement | HTMLCanvasElement,
		destRect: Rectangle,
		srcRect: Rectangle,
		fillType: EImageFillType = EImageFillType.STRETCH,
	): boolean {
		if (srcRect.isEmpty()) {
			return false;
		}

		if (destRect.isEmpty()) {
			return false;
		}

		if (fillType === EImageFillType.STRETCH) {
			context.drawImage(
				img,
				srcRect.origin.x,
				srcRect.origin.y,
				srcRect.size.width,
				srcRect.size.height,
				destRect.origin.x,
				destRect.origin.y,
				destRect.size.width,
				destRect.size.height,
			);
		} else {
			let rows: number = Math.ceil(destRect.size.width / srcRect.size.width);
			let colums: number = Math.ceil(destRect.size.height / srcRect.size.height);

			let left: number = 0;
			let top: number = 0;

			let right: number = 0;
			let bottom: number = 0;

			let width: number = 0;
			let height: number = 0;

			let destRight: number = destRect.origin.x + destRect.size.width;
			let destBottom: number = destRect.origin.y + destRect.size.height;

			if (fillType === EImageFillType.REPEAT_X) {
				colums = 1;
			} else if (fillType === EImageFillType.REPEAT_Y) {
				rows = 1;
			}

			for (let i: number = 0; i < rows; i++) {
				for (let j: number = 0; j < colums; j++) {
					left = destRect.origin.x + i * srcRect.size.width;
					top = destRect.origin.y + j * srcRect.size.height;

					width = srcRect.size.width;
					height = srcRect.size.height;

					right = left + width;
					bottom = top + height;

					if (right > destRight) {
						width = srcRect.size.width - (right - destRight);
					}

					if (bottom > destBottom) {
						height = srcRect.size.height - (bottom - destBottom);
					}

					context.drawImage(img, srcRect.origin.x, srcRect.origin.y, width, height, left, top, width, height);
				}
			}
		}
		return true;
	}

	public draw(transformable: ITransformable, state: IRenderState, context: CanvasRenderingContext2D): void {
		for (let i: number = 0; i < this.srcRects.length; i++) {
			this._drawImage(context, this.data.image, this.destRects[i], this.srcRects[i], EImageFillType.STRETCH);
		}
	}
}
