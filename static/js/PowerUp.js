import { POWERUP_RADIUS } from './game.js';

export class PowerUp {
    constructor(canvasWidth, canvasHeight, currentIcebergShape) {
        this.spawn(canvasWidth, canvasHeight, currentIcebergShape);
    }

    spawn(canvasWidth, canvasHeight, currentIcebergShape) {
        if (!currentIcebergShape) {
            console.error('Invalid iceberg shape provided to PowerUp');
            return;
        }

        let x, y;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        do {
            switch (currentIcebergShape.type) {
                case 'circle':
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * (currentIcebergShape.radius - POWERUP_RADIUS - 20);
                    x = centerX + Math.cos(angle) * distance;
                    y = centerY + Math.sin(angle) * distance;
                    break;
                case 'rectangle':
                    x = centerX - currentIcebergShape.width/2 + POWERUP_RADIUS + Math.random() * (currentIcebergShape.width - 2*POWERUP_RADIUS);
                    y = centerY - currentIcebergShape.height/2 + POWERUP_RADIUS + Math.random() * (currentIcebergShape.height - 2*POWERUP_RADIUS);
                    break;
                case 'triangle':
                    const triangleHeight = currentIcebergShape.size * Math.sqrt(3) / 2;
                    x = centerX - currentIcebergShape.size/2 + Math.random() * currentIcebergShape.size;
                    const maxY = centerY + triangleHeight/2 - (Math.abs(x - centerX) / (currentIcebergShape.size/2)) * triangleHeight;
                    y = centerY - triangleHeight/2 + POWERUP_RADIUS + Math.random() * (maxY - (centerY - triangleHeight/2) - 2*POWERUP_RADIUS);
                    break;
                default:
                    console.error('Unknown iceberg shape:', currentIcebergShape.type);
                    return;
            }
        } while (this.isOutsideIceberg(x, y, centerX, centerY, currentIcebergShape));

        this.x = x;
        this.y = y;
        this.type = Math.random() < 0.5 ? 'speed' : 'size';
    }

    isOutsideIceberg(x, y, centerX, centerY, shape) {
        switch (shape.type) {
            case 'circle':
                const distance = Math.sqrt((x - centerX)**2 + (y - centerY)**2);
                return distance > shape.radius - POWERUP_RADIUS;
            case 'rectangle':
                return x < centerX - shape.width/2 + POWERUP_RADIUS ||
                       x > centerX + shape.width/2 - POWERUP_RADIUS ||
                       y < centerY - shape.height/2 + POWERUP_RADIUS ||
                       y > centerY + shape.height/2 - POWERUP_RADIUS;
            case 'triangle':
                const dx = Math.abs(x - centerX);
                const dy = y - (centerY - shape.size/2);
                return dy > shape.size/2 - POWERUP_RADIUS || dx > (shape.size/2 - dy/2) - POWERUP_RADIUS;
            default:
                console.error('Unknown iceberg shape in isOutsideIceberg:', shape.type);
                return true;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, POWERUP_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = this.type === 'speed' ? 'yellow' : 'green';
        ctx.fill();
        ctx.closePath();
    }
}
