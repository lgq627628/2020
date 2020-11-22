class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.length = this.getLenth();
    this.dir = this.getDir();
    return this;
  }

  rotate(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    const [x, y] = this;
    this.x = x * c + y * -s;
    this.y = x * s + y * c;
    return this;
  }

  scale() {

  }

  getLenth() {
    return Math.hypot(this.x, this.y);
  }

  getDir() {
    return Math.atan2(this.y, this.x); // Math.atan2 的取值范围是 -π到π，负数表示在 x 轴下方，正数表示在 x 轴上方。
  }
}
