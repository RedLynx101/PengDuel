import { ICEBERG_RADIUS, POWERUP_RADIUS } from './game.js';

export class PowerUp {
    constructor(canvasWidth, canvasHeight) {
        this.spawn(canvasWidth, canvasHeight);
    }

    spawn(canvasWidth, canvasHeight) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (ICEBERG_RADIUS - POWERUP_RADIUS - 20);
        this.x = canvasWidth / 2 + Math.cos(angle) * distance;
        this.y = canvasHeight / 2 + Math.sin(angle) * distance;
        this.type = Math.random() < 0.5 ? 'speed' : 'size';
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, POWERUP_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = this.type === 'speed' ? 'yellow' : 'green';
        ctx.fill();
        ctx.closePath();
    }
}
