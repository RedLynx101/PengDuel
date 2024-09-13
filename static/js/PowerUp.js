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
        this.animationFrame = 0;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, POWERUP_RADIUS, 0, Math.PI * 2);
        if (this.type === 'speed') {
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, POWERUP_RADIUS);
            gradient.addColorStop(0, 'yellow');
            gradient.addColorStop(1, 'orange');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = 'green';
        }
        ctx.fill();
        ctx.closePath();

        // Add pulsating effect for speed power-up
        if (this.type === 'speed') {
            this.animationFrame += 0.1;
            const pulseFactor = 1 + Math.sin(this.animationFrame) * 0.2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, POWERUP_RADIUS * pulseFactor, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }
    }
}
