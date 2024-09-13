import { Penguin } from './Penguin.js';
import { PENGUIN_RADIUS, ICEBERG_RADIUS } from './game.js';

export class AIPenguin extends Penguin {
    constructor(x, y, color, name, penguinSVG) {
        super(x, y, color, name, penguinSVG);
        console.log(`AIPenguin constructor called for ${name}, SVG passed: ${!!penguinSVG}`);
        this.initialX = x;
        this.initialY = y;
        this.initialAcceleration = 0.15;
        this.initialMaxSpeed = 50;
        this.reset();
    }

    update(canvas, gameState, winner, audioManager, scores, updateLeaderboard, player1) {
        super.update(canvas, gameState, winner, audioManager, scores, updateLeaderboard);
        this.updateTarget(canvas, player1);
        this.moveTowardsTarget();
        return gameState;
    }

    updateTarget(canvas, player1) {
        if (Math.random() < 0.65) {  // 65% of the time, target the player
            const offsetX = (Math.random() - 0.5) * PENGUIN_RADIUS * 8;
            const offsetY = (Math.random() - 0.5) * PENGUIN_RADIUS * 8;
            this.targetX = player1.x + offsetX;
            this.targetY = player1.y + offsetY;
        } else {  // 35% of the time, choose a random point on the iceberg
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * (ICEBERG_RADIUS - PENGUIN_RADIUS);
            this.targetX = canvas.width / 2 + Math.cos(angle) * distance;
            this.targetY = canvas.height / 2 + Math.sin(angle) * distance;
        }
    }

    moveTowardsTarget() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only apply movement if the distance is significant
        if (distance > .3) {
            // Normalize direction vector
            const vx = (dx / distance) * this.acceleration;
            const vy = (dy / distance) * this.acceleration;

            // Add acceleration to the current velocity
            this.vx += vx;
            this.vy += vy;

            // Calculate the current speed
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

            // Ensure the AI doesn't exceed the maximum speed
            if (currentSpeed > this.maxSpeed) {
                const scale = this.maxSpeed / currentSpeed;
                this.vx *= scale;
                this.vy *= scale;
            }
        }
        console.log(`AI Speed: ${Math.sqrt(this.vx * this.vx + this.vy * this.vy)}`);
    }

    reset() {
        console.log('Resetting AIPenguin');
        this.x = this.initialX;
        this.y = this.initialY;
        this.vx = 0;
        this.vy = 0;
        this.acceleration = this.initialAcceleration;
        this.maxSpeed = this.initialMaxSpeed;
        console.log(`AIPenguin reset - Position: (${this.x}, ${this.y}), Acceleration: ${this.acceleration}, Max Speed: ${this.maxSpeed}`);
    }
}
