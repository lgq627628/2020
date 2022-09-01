// 将二维平面上的碰撞转化成一维平面
// 比如：将粒子碰撞的圆心连线，与x轴形成θ夹角，将速度u旋转θ角至水平方向，将二维完全弹性碰撞转化为一维问题，算出碰撞后的速度v，再旋转-θ角就能解决
class Particle {
    update() {
        // 遍历所有粒子，排除自己
        for (let i = 0; i < this.particleArr.length; i++) {
            const temp = this.particleArr[i];
            if (this === temp) continue;
            const distance = getDistance(this.x, this.y, temp.x, temp.y);
            // 检测是否相交，相交则碰撞
            if (distance < this.r + temp.r) {
                resolveCollision(this, temp);
            }
        }

        this.draw();
    }
}
// 向量/矩阵旋转公式，即改变向量的基
const rotate = (velocity: Velocity, angle: number) => ({
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
});

const resolveCollision = (p1: Particle, p2: Particle) => {
    // 圆心作差得出向量dist，速度作差得出向量velocityDiff
    const xVelocityDiff = p1.velocity.x - p2.velocity.x;
    const yVelocityDiff = p1.velocity.y - p2.velocity.y;

    const xDist = p2.x - p1.x;
    const yDist = p2.y - p1.y;

    // 求dist和velocityDiff的向量点积，即正交基下的点积：u·v=ux·vx+uy+vy
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        // 求圆心连线和x轴的夹角angle
        const angle = -Math.atan2(p2.y - p1.y, p2.x - p1.x);

        const m1 = p1.mass;
        const m2 = p2.mass;

        // 旋转angle，从二维完全弹性碰撞变成一维完全弹性碰撞
        const u1 = rotate(p1.velocity, angle);
        const u2 = rotate(p2.velocity, angle);

        // 一维完全弹性碰撞只要求水平方向即可
        const v1 = {
            x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
            y: u1.y,
        };
        const v2 = {
            x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
            y: u2.y,
        };

        // 得出水平方向的速度后，再次旋转-angle恢复作案现场
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // 各自取分量赋值即可
        p1.velocity.x = vFinal1.x;
        p1.velocity.y = vFinal1.y;

        p2.velocity.x = vFinal2.x;
        p2.velocity.y = vFinal2.y;
    }
};
