import { BaseObject } from './Cocos.js'
import { Utils } from './Utils.js';

export class GameMgr {
    constructor(id) {
        this.id = id;
        this.map = new GameMap({ id: this.id });
        this.players = [];
        this.players.push(new Player({ map: this.map, x: this.map.width / 2, y: this.map.height / 2, radius: this.map.height * 0.05, speed: this.map.height * 1, isMe: true }));
        for (let i = 0; i < 6; i++) {
            this.players.push(new Player({ map: this.map, x: this.map.width / 2, y: this.map.height / 2, radius: this.map.height * 0.05, speed: this.map.height * .3, isMe: false, color: Utils.getRandomColor() }));
        }
        this.map.players = this.players;
    }
}

class GameMap extends BaseObject {
    constructor({ id }) {
        super();
        this.canvas = $('<canvas></canvas>');
        this.ctx = this.canvas[0].getContext('2d');
        this.width = $(id).width();
        this.height = $(id).height();
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;
        $(id).append(this.canvas);
    }
    start() {
    }
    update() {
        this.render();
    }
    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; // 加个半透明就会有个拖尾模糊的效果
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}

class Player extends BaseObject {
    constructor({ map, x, y, radius, speed, isMe, color = '#fff' }) {
        super();
        this.map = map;
        this.ctx = map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.dirX = 0;
        this.dirY = 0;
        this.isMe = isMe;
        this.color = color;
        this.zeroLen = 0.1; // 小于 0.1 就算 0
        this.moveLen = 0; // 当前需要移动的距离

        // 受到攻击后反向作用力
        this.hurtDirX = 0;
        this.hurtDirY = 0;
        this.hurtSpeed = 0;
        this.friction = 0;
        this.zeroSpeed = 10;
    }
    start() {
        if (this.isMe) {
            this.addEvent();
        } else {
            this.createRandomPosAndMove();
        }
    }
    createRandomPosAndMove() {
        const x = Math.random() * this.map.width;
        const y = Math.random() * this.map.height;
        this.moveTo(x, y);
    }
    addEvent() {
        this.map.canvas.on('click', e => {
            this.moveTo(e.clientX, e.clientY);
        });
        $(window).on('keydown', e => {
            if (e.keyCode !== 32) return;
            this.fire();
        });
        setTimeout(() => {
            setInterval(() => {
                this.fire();
            }, 200);
        }, 3000);
    }
    fire() {
        // if (this.dirX && this.dirY) new Ball({ player: this, map: this.map, radius: this.radius * 0.3, speed: this.speed * 2 });
        new Ball({ player: this, map: this.map, radius: this.radius * 0.3, speed: this.speed * 2 });
    }
    hurt(angle) {
        this.radius = this.radius * 0.8;
        this.hurtBack(angle);
        this.boom();
        if (this.radius < this.map.height * 0.01) this.destory();
    }
    hurtBack(angle) { // 撞击后退
        this.hurtDirX = Math.cos(angle);
        this.hurtDirY = Math.sin(angle);
        this.hurtSpeed = this.speed * 0.8;
        this.friction = 0.96;
    }
    moveTo(tx, ty) {
        this.moveLen = Utils.getDistance(this.x, this.y, tx, ty);
        const angle = Math.atan2(ty - this.y, tx - this.x);
        this.dirX = Math.cos(angle);
        this.dirY = Math.sin(angle);
    }
    render() {
        const { ctx, x, y, radius, color } = this;
        Utils.drawCircle({ ctx, x, y, radius, color });
    }
    update() {
        if (this.hurtSpeed > this.zeroSpeed) {
            const moved = this.hurtSpeed * this.timeDelta / 1000;
            this.x += this.hurtDirX * moved;
            this.y += this.hurtDirY * moved;
            this.hurtSpeed *= this.friction;
        } else {
                if (this.moveLen < this.zeroLen) {
                this.moveLen = 0;
                this.dirX = 0;
                this.dirY = 0;
                if (!this.isMe) {
                    this.createRandomPosAndMove();
                }
            } else {
                const moved = Math.min(this.moveLen, this.speed * this.timeDelta / 1000);
                this.x += this.dirX * moved;
                this.y += this.dirY * moved;
                this.moveLen -= moved;
            }
        }
        this.render();
    }
    boom() {
        for (let i = 0; i < 10 + Math.random() * 10; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const dirX =  Math.cos(angle);
            const dirY = Math.sin(angle);
            new Particle({ map: this.map, x: this.x, y: this.y, dirX, dirY, radius: 2, speed: this.map.height * 2 * Math.random(), color: this.color });            
        } 
    }
    destory() {
        if (this.isMe) return;
        this.boom();
    }
}

class Ball extends BaseObject {
    constructor({ map, player, radius, speed, color = 'orange', moveLen }) {
        super();
        this.map = map;
        this.ctx = map.ctx;
        this.player = player;
        this.x = player.x;
        this.y = player.y;
        this.radius = radius;
        this.speed = speed;
        this.dirX = player.dirX;
        this.dirY = player.dirY;
        this.color = color;
        this.zeroLen = 0.1; // 小于 0.1 就算 0
        this.moveLen = moveLen || map.height; // 子弹具有一定射程
    }

    start() {
        const angle = Math.random() * 2 * Math.PI;
        this.dirX =  Math.cos(angle);
        this.dirY = Math.sin(angle);
    }
    render() {
        const { ctx, x, y, radius, color } = this;
        Utils.drawCircle({ ctx, x, y, radius, color });
    }
    update() {
        if (this.moveLen < this.zeroLen) {
            this.destory();
            return;
        }
        this.map.players.forEach(player => {
            if (player !== this.player && Utils.isHit(this.x, this.y, this.radius, player.x, player.y, player.radius)) {
                this.destory();
                player.hurt(Math.atan2(this.dirY, this.dirX));
            }
        });
        const moved = Math.min(this.moveLen, this.speed * this.timeDelta / 1000);
        this.x += moved * this.dirX;
        this.y += moved * this.dirY;
        this.moveLen -= moved;
        this.render();
    }
}

class Particle extends BaseObject {
    constructor({ map, x, y, radius, dirX, dirY, speed, color = 'lightblue' }) {
        super();
        this.map = map;
        this.ctx = map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dirX =  dirX;
        this.dirY = dirY;
        this.speed = speed;
        this.friction = 0.9;
        this.zeroSpeed = 50;
    }
    start() {
        
    }
    render() {
        const { ctx, x, y, radius, color } = this;
        Utils.drawCircle({ ctx, x, y, radius, color });
    }
    update() {
        if (this.speed < this.zeroSpeed) {
            this.destory();
            return;
        }
        const moved = this.speed * this.timeDelta / 1000;
        this.x += moved * this.dirX;
        this.y += moved * this.dirY;
        this.speed *= this.friction;
        this.render();
    }
}