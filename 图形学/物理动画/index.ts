import { Ball } from './ball';
import { Utils } from './Utils';

const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

const ballNum: number = 10;
const balls: Ball[] = [];

for(let i = 0; i < ballNum; i++) {
    const ball: Ball = new Ball();
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.color = Utils.getRandomColor();

    ball.speed = Utils.getRandom(5, 10);
    ball.vx = ball.speed * Math.cos(Utils.getRandom(0, 360) * Math.PI / 180);
    ball.vy = ball.speed * Math.sin(Utils.getRandom(0, 360) * Math.PI / 180);
    balls.push(ball);
}

// 1、初始化变量
const g = 0.2;
const f = 0.95;
const bounce = -0.8;


(function frame() {
    window.requestAnimationFrame(frame);

    // 2、清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 3、修改物体位置
    balls.forEach(ball => {
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.x <= -ball.r ||
            ball.x >= canvas.width + ball.r ||
            ball.y <= -ball.r ||
            ball.y >= canvas.height + ball.r) {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.speed = Utils.getRandom(10, 20);
            ball.vx = ball.speed * Math.cos(Utils.getRandom(0, 360) * Math.PI / 180);
            ball.vy = ball.speed * Math.sin(Utils.getRandom(0, 360) * Math.PI / 180);
        }
        ball.fill(ctx);

        ball.vy += g;
    });

    // let idHitX = false;
    // let idHitY = false;

    // if (ball.y + ball.r >= canvas.height) {
    //     // vy *= bounce;
    //     // vy *= -1;
    //     idHitY = true;
    //     ball.y = canvas.height - ball.r;
    // } else if (ball.x <= ball.r) {
    //     ball.x = ball.r;
    //     idHitX = true;
    //     // vx *= -1;
    // } else if (ball.x >= canvas.width - ball.r) {
    //     ball.x = canvas.width - ball.r;
    //     idHitX = true;
    //     // vx *= -1;
    // } else if (ball.y <= ball.r) {
    //     // vy *= -1;
    //     idHitY = true;
    //     ball.y = ball.r;
    // }
    // 4、重绘
    // ball.fill(ctx);

    // 5、修改变量
    // vy += g;
    // vx *= f;
    // vy *= f;
    // if (idHitX) vx *= -1
    // if (idHitY) vy *= -1
})()