type LineCap = 'butt' | 'round' | 'square';
type LineJoin = 'bevel' | 'round' | 'miter';

type TextAlign = 'start' | 'center' | 'end' | 'left' | 'right';
type TextBaseLine = 'top' | 'bottom' | 'middle' | 'alphabetic' | 'ideographic' | 'hanging';

type GlobalCompositeOperation =
	| 'source-over'
	| 'source-atop'
	| 'source-in'
	| 'source-out'
	| 'destination-over'
	| 'destination-atop'
	| 'destination-in'
	| 'destination-out'
	| 'lighte'
	| 'copy'
	| 'xor';

export class Canvas2DUtil {
	public static Colors: string[] = [
		//'black' ,   //黑色
		// 'white' ,   //白色
		'aqua', //浅绿色
		'blue', //蓝色
		'fuchsia', //紫红色
		'gray', //灰色
		'green', //绿色
		'lime', //绿黄色
		'maroon', //褐红色
		'navy', //海军蓝
		'olive', //橄榄色
		'orange', //橙色
		'purple', //紫色
		'red', //红色
		'silver', //银灰色
		'teal', //蓝绿色
		'yellow', //黄色
	];

	public static printAllStates(ctx: CanvasRenderingContext2D): void {
		console.log('*********LineState**********');
		console.log(' lineWidth : ' + ctx.lineWidth);
		console.log(' lineCap : ' + ctx.lineCap);
		console.log(' lineJoin : ' + ctx.lineJoin);
		console.log(' miterLimit : ' + ctx.miterLimit);

		console.log('*********LineDashState**********');
		console.log(' lineDashOffset : ' + ctx.lineDashOffset);

		console.log('*********ShadowState**********');
		console.log(' shadowBlur : ' + ctx.shadowBlur);
		console.log(' shadowColor : ' + ctx.shadowColor);
		console.log(' shadowOffsetX : ' + ctx.shadowOffsetX);
		console.log(' shadowOffsetY : ' + ctx.shadowOffsetY);

		console.log('*********TextState**********');
		console.log(' font : ' + ctx.font);
		console.log(' textAlign : ' + ctx.textAlign);
		console.log(' textBaseline : ' + ctx.textBaseline);

		console.log('*********RenderState**********');
		console.log(' strokeStyle : ' + ctx.strokeStyle);
		console.log(' fillStyle : ' + ctx.fillStyle);
		console.log(' globalAlpha : ' + ctx.globalAlpha);
		console.log(' globalCompositeOperation : ' + ctx.globalCompositeOperation);
	}

	public static state(ctx: CanvasRenderingContext2D, save: boolean = true) {
		if (save === true) {
			ctx.save();
		} else {
			ctx.restore();
		}
	}

	public static setLineState(
		ctx: CanvasRenderingContext2D,
		lineWidth: number = 1.0,
		lineCap: LineCap = 'butt',
		lineJoint: LineJoin = 'miter',
		miterLimit: number = 10.0,
	): void {
		ctx.lineWidth = lineWidth;
		ctx.lineCap = lineCap;
		ctx.lineJoin = lineJoint;
		ctx.miterLimit = miterLimit;
	}

	public static setLineDashState(ctx: CanvasRenderingContext2D, lineDashArray: number[], lineDashOffset: number = 0.0): void {
		ctx.setLineDash(lineDashArray);
		ctx.lineDashOffset = lineDashOffset;
	}

	public static setShadowState(
		ctx: CanvasRenderingContext2D,
		shadowBlur: number = 0,
		shadowColor: string = 'rgba(0, 0, 0, 0)',
		shadowOffsetX: number = 0,
		shadowOffsetY: number = 0,
	): void {
		ctx.shadowBlur = shadowBlur;
		ctx.shadowColor = shadowColor;
		ctx.shadowOffsetX = shadowOffsetX;
		ctx.shadowOffsetY = shadowOffsetY;
	}

	public static setTextState(ctx: CanvasRenderingContext2D, font: string, textAlign: TextAlign = 'left', textBaseLine: TextBaseLine = 'top'): void {
		ctx.font = font;
		ctx.textAlign = textAlign;
		ctx.textBaseline = textBaseLine;
	}

	public static setRenderState(
		ctx: CanvasRenderingContext2D,
		strokeStyle: string | CanvasGradient | CanvasPattern = '#000000',
		fillStyle: string | CanvasGradient | CanvasPattern = '#000000',
		globalAlpha: number = 1.0,
		compositeOperation: GlobalCompositeOperation = 'source-over',
	): void {
		ctx.strokeStyle = strokeStyle;
		ctx.fillStyle = fillStyle;
		ctx.globalAlpha = globalAlpha;
		ctx.globalCompositeOperation = compositeOperation;
	}
}
