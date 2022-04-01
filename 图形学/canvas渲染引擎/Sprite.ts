class Sprite {
    public name: string;
    public painter: Object;
    public actions: Object[];
    public visible: boolean;
    public top: number;
    public left: number;
    public width: number;
    public height: number;
    public vx: number;
    public vy: number;
    constructor(name, painter, actions = []) {
        this.name = name;
        this.painter = painter;
        this.actions = actions;
        this.visible = true;
        this.top = 0;
        this.left = 0;
        this.width = 10;
        this.height = 10;
        this.vx = 0;
        this.vy = 0;
    }
    update(ctx2d, t) {
        if (!this.visible || !this.paint) return;
        this.actions.forEach((action) => {
            action.execute(this, ctx2d, t);
        });
    }
    paint(ctx2d) {
        if (!this.visible || !this.paint) return;
        this.painter.paint(this, ctx2d);
    }
}
