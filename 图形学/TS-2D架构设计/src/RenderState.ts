// 模拟渲染状态机
// 基本上所有的渲染API（例如D3D、OpenGL、GDI+、Skia和Quartz2D等）都是使用这种模式进行渲染状态的管理，属于主流技术
// save 和 restore 可以嵌套使用，但必须配对，否则堆栈会乱，出现各种预想不到的问题，切记
export class RenderState {
    public lineWidth: number = 1;
    public fillStyle: string = 'black';
    public strokeStyle: string = 'red';

    clone(): RenderState {
        const state = new RenderState();
        state.lineWidth = this.lineWidth;
        state.strokeStyle = this.strokeStyle;
        state.fillStyle = this.fillStyle;
        return state;
    }

    toString(): string {
        return JSON.stringify(this, null, '  ');
    }
}


export class RenderStateStack {
    // 在渲染状态堆栈初始化时，在栈顶有一个默认渲染状态对象，这是一个全局状态对象
    private _stack: RenderState[] = [new RenderState()];
    private get _currentState(): RenderState {
        return this._stack[this._stack.length - 1];
    }
    // save 方法会克隆栈顶的元素，并将克隆后的元素压栈成为当前元素
    save() {
        this._stack.push(this._currentState.clone());
    }
    // restore 方法会将栈顶元素丢弃，这样前一个元素就成为了栈顶元素，这意味着它又恢复到上一级的渲染状态
    restore() {
        this._stack.pop();
    }
    printCurrentStateInfo() {
        console.log(this._currentState.toString());
    }
    //  所有的读写属性（lineWidth、strokeStyle、fillStyle）都是针对栈顶元素（当前渲染状态）进行操作的
    get lineWidth(): number {
        return this._currentState.lineWidth;
    }
    set lineWidth(value: number) {
        this._currentState.lineWidth = value;
    }
    get strokeStyle(): string {
        return this._currentState.strokeStyle;
    }
    set strokeStyle(value: string) {
        this._currentState.strokeStyle = value;
    }
    get fillStyle(): string {
        return this._currentState.fillStyle;
    }
    set fillStyle(value: string) {
        this._currentState.fillStyle = value;
    }

}