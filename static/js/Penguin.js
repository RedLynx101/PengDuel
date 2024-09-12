import { PENGUIN_RADIUS, ICEBERG_RADIUS, FRICTION, PUSH_FORCE } from './game.js';

export class Penguin {
    constructor(x, y, color, name, penguinSVG) {
        console.log(`Penguin constructor called for ${name}`);
        this.x = x;
        this.y = y;
        this.color = color;
        this.name = name;
        this.vx = 0;
        this.vy = 0;
        this.crowned = false;
        this.originalRadius = PENGUIN_RADIUS;
        this.originalMass = 1;
        this.currentRadius = this.originalRadius;
        this.mass = this.originalMass;
        this.powerUpActive = false;
        this.powerUpType = null;
        this.powerUpEndTime = 0;
        this.svgImage = null;
        this.loadSVG(penguinSVG);
    }

    loadSVG(penguinSVG) {
        if (penguinSVG) {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(penguinSVG, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;

            svgElement.querySelectorAll('circle, path').forEach(element => {
                if (element.getAttribute('fill') !== '#FFFFFF') {
                    element.setAttribute('fill', this.color);
                }
            });

            const svgString = new XMLSerializer().serializeToString(svgElement);
            const img = new Image();
            img.onload = () => {
                console.log(`SVG image loaded for ${this.name}`);
                this.svgImage = img;
            };
            img.onerror = (error) => {
                console.error(`Error loading SVG for ${this.name}:`, error);
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
        }
    }

    update(canvas, gameState, winner, audioManager, scores, updateLeaderboard) {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= FRICTION;
        this.vy *= FRICTION;

        if (this.powerUpActive && Date.now() > this.powerUpEndTime) {
            this.deactivatePowerUp();
        }

        return gameState;
    }

    draw(ctx) {
        console.log(`Drawing penguin: ${this.name}, position: (${this.x}, ${this.y})`);
        if (this.svgImage) {
            ctx.drawImage(this.svgImage, this.x - this.currentRadius, this.y - this.currentRadius, this.currentRadius * 2, this.currentRadius * 2);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
        this.drawNameAndCrown(ctx);
    }

    drawNameAndCrown(ctx) {
        console.log(`Drawing name and crown for ${this.name}, crowned: ${this.crowned}`);
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y + this.currentRadius + 20);

        if (this.crowned) {
            console.log(`Drawing crown for ${this.name}`);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.currentRadius - 15);
            ctx.lineTo(this.x - 15, this.y - this.currentRadius);
            ctx.lineTo(this.x + 15, this.y - this.currentRadius);
            ctx.closePath();
            ctx.fillStyle = 'gold';
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        if (this.powerUpActive) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentRadius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = this.powerUpType === 'speed' ? 'yellow' : 'green';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    activatePowerUp(type) {
        this.powerUpActive = true;
        this.powerUpType = type;
        this.powerUpEndTime = Date.now() + 10000; // 10 seconds

        if (type === 'speed') {
            this.vx *= 2;
            this.vy *= 2;
        } else if (type === 'size') {
            this.currentRadius = this.originalRadius * 1.5;
            this.mass = this.originalMass * 2;
        }
    }

    deactivatePowerUp() {
        if (this.powerUpType === 'speed') {
            this.vx /= 2;
            this.vy /= 2;
        } else if (this.powerUpType === 'size') {
            this.currentRadius = this.originalRadius;
            this.mass = this.originalMass;
        }
        this.powerUpActive = false;
        this.powerUpType = null;
    }

    setCrowned(crowned) {
        console.log(`Setting crowned status for ${this.name}: ${crowned}`);
        this.crowned = crowned;
    }

    removeCrown() {
        this.crowned = false;
    }
}
