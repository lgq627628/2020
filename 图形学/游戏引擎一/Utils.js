export const Utils = {
    drawCircle({ ctx, x, y, radius, color = '#fff' }) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fill();
    },
    getDistance(x1, y1, x2, y2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    },
    isHit(x1, y1, r1, x2, y2, r2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return dx * dx + dy * dy < (r1 + r2) * (r1 + r2)
    },
    getRandomColor() {
        return '#' + Math.random().toString(16).slice(2, 8);
    }
}