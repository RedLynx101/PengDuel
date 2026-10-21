import { settings, WORLD, POWERUP } from './config.js';

export class PowerUp {
  constructor(clockMs) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * settings.icebergRadius * 0.7;
    this.x = WORLD.cx + Math.cos(angle) * distance;
    this.y = WORLD.cy + Math.sin(angle) * distance;
    this.type = Math.random() < 0.5 ? 'speed' : 'size';
    this.bornAt = clockMs;
    this.taken = false;
  }

  draw(ctx, clockMs) {
    const age = clockMs - this.bornAt;
    const grow = Math.min(1, age / 320);
    const scale = grow < 1 ? 1 - (1 - grow) ** 3 : 1;
    const bob = Math.sin(age / 260) * 3;
    const r = POWERUP.radius * scale;
    const [light, dark] = this.type === 'speed' ? ['#fde68a', '#f59e0b'] : ['#a7f3d0', '#10b981'];

    ctx.save();
    ctx.translate(this.x, this.y + bob);

    // Glow.
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.6);
    glow.addColorStop(0, this.type === 'speed' ? 'rgba(251, 191, 36, 0.45)' : 'rgba(52, 211, 153, 0.45)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.6, 0, Math.PI * 2);
    ctx.fill();

    // Orb.
    const orb = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
    orb.addColorStop(0, light);
    orb.addColorStop(1, dark);
    ctx.fillStyle = orb;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Icon.
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    if (this.type === 'speed') {
      const s = r / 15;
      ctx.beginPath();
      ctx.moveTo(2 * s, -10 * s);
      ctx.lineTo(-6 * s, 2 * s);
      ctx.lineTo(-0.5 * s, 2 * s);
      ctx.lineTo(-3 * s, 10 * s);
      ctx.lineTo(6 * s, -3 * s);
      ctx.lineTo(0.5 * s, -3 * s);
      ctx.closePath();
      ctx.fill();
    } else {
      const s = r / 15;
      ctx.lineWidth = 2.4 * s;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(-6 * s, 2 * s);
      ctx.lineTo(0, -5 * s);
      ctx.lineTo(6 * s, 2 * s);
      ctx.moveTo(-6 * s, 8 * s);
      ctx.lineTo(0, 1 * s);
      ctx.lineTo(6 * s, 8 * s);
      ctx.stroke();
    }

    // Pulse ring.
    const pulse = (age % 1400) / 1400;
    ctx.globalAlpha = (1 - pulse) * 0.6;
    ctx.strokeStyle = light;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r * (1 + pulse * 0.9), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
