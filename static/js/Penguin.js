import { settings, POWERUP } from './config.js';
import { shade, roundRect } from './render.js';

const BASE_ACCEL = 0.16;
const BASE_MAX_SPEED = 7.5;

export class Penguin {
  constructor({ x, y, color, name, facing = 0 }) {
    this.color = color;
    this.name = name;
    this.crowned = false;
    this.reset(x, y, facing);
  }

  reset(x, y, facing = 0) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing;
    this.waddle = 0;
    this.powerUp = null; // { type, endsAt }
    this.sink = 0; // 0 standing, 1 fully under water
    this.out = false;
  }

  get baseRadius() {
    return settings.penguinRadius;
  }

  get currentRadius() {
    if (this.powerUp?.type === 'speed') return this.baseRadius * 0.6;
    if (this.powerUp?.type === 'size') return this.baseRadius * 1.9;
    return this.baseRadius;
  }

  get mass() {
    if (this.powerUp?.type === 'speed') return 0.85;
    if (this.powerUp?.type === 'size') return 2.4;
    return 1;
  }

  get accel() {
    if (this.powerUp?.type === 'speed') return BASE_ACCEL * 1.45;
    if (this.powerUp?.type === 'size') return BASE_ACCEL * 0.8;
    return BASE_ACCEL;
  }

  get maxSpeed() {
    return this.powerUp?.type === 'speed' ? BASE_MAX_SPEED * 1.35 : BASE_MAX_SPEED;
  }

  get speed() {
    return Math.hypot(this.vx, this.vy);
  }

  /** Accelerate along an input direction; (ix, iy) need not be normalized. */
  applyInput(ix, iy, strength = 1) {
    const length = Math.hypot(ix, iy);
    if (length < 0.001) return;
    this.vx += (ix / length) * this.accel * strength;
    this.vy += (iy / length) * this.accel * strength;
  }

  step(clockMs) {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= settings.friction;
    this.vy *= settings.friction;

    const speed = this.speed;
    if (speed > this.maxSpeed) {
      this.vx *= this.maxSpeed / speed;
      this.vy *= this.maxSpeed / speed;
    }
    if (speed > 0.25) {
      // Turn smoothly toward the direction of travel.
      const target = Math.atan2(this.vy, this.vx);
      let delta = target - this.facing;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      this.facing += delta * 0.18;
    }
    this.waddle += Math.min(speed, 6) * 0.11;

    if (this.powerUp && clockMs > this.powerUp.endsAt) this.powerUp = null;
  }

  activatePowerUp(type, clockMs) {
    this.powerUp = { type, endsAt: clockMs + POWERUP.durationMs };
  }

  draw(ctx, clockMs) {
    const r = this.currentRadius;
    const scale = 1 - this.sink * 0.55;
    ctx.save();
    ctx.globalAlpha = 1 - this.sink * 0.85;
    ctx.translate(this.x, this.y);

    // Soft shadow on the ice.
    if (!this.out) {
      ctx.fillStyle = 'rgba(15, 40, 70, 0.22)';
      ctx.beginPath();
      ctx.ellipse(3, r * 0.55, r * 1.05, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.scale(scale, scale);
    ctx.rotate(this.facing);
    const flap = Math.sin(this.waddle) * 0.35;

    // Feet.
    ctx.fillStyle = '#fb923c';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(r * 0.55, side * r * 0.42 + Math.sin(this.waddle + side) * r * 0.08, r * 0.24, r * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Flippers.
    ctx.fillStyle = shade(this.color, -0.35);
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(-r * 0.05, side * r * 0.82);
      ctx.rotate(side * (0.35 + flap * side));
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.5, r * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Body.
    const body = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.2, 0, 0, r * 1.05);
    body.addColorStop(0, shade(this.color, 0.25));
    body.addColorStop(1, shade(this.color, -0.25));
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(6, 18, 31, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // White face and belly, toward the direction of travel.
    ctx.fillStyle = '#f8fbff';
    ctx.beginPath();
    ctx.ellipse(r * 0.28, 0, r * 0.58, r * 0.66, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes.
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(r * 0.5, side * r * 0.3, r * 0.17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0b1220';
      ctx.beginPath();
      ctx.arc(r * 0.56, side * r * 0.3, r * 0.095, 0, Math.PI * 2);
      ctx.fill();
    }

    // Beak.
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(r * 1.18, 0);
    ctx.lineTo(r * 0.78, -r * 0.16);
    ctx.lineTo(r * 0.78, r * 0.16);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /** Rings, crown and name tag; drawn after every body so labels are never hidden. */
  drawLabels(ctx, clockMs, ui = 1) {
    if (this.sink >= 0.2) return;
    const r = this.currentRadius;
    // Power-up ring with a countdown arc.
    if (this.powerUp) {
      const color = this.powerUp.type === 'speed' ? '#fbbf24' : '#34d399';
      const left = Math.max(0, (this.powerUp.endsAt - clockMs) / POWERUP.durationMs);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, r + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r + 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
      ctx.stroke();
    }

    // Crown for the last round's winner.
    if (this.crowned) {
      const bob = Math.sin(clockMs / 300) * 2;
      const cy = this.y - r - 16 + bob;
      ctx.save();
      ctx.translate(this.x, cy);
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-12, 6);
      ctx.lineTo(-13, -6);
      ctx.lineTo(-6, 0);
      ctx.lineTo(0, -9);
      ctx.lineTo(6, 0);
      ctx.lineTo(13, -6);
      ctx.lineTo(12, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef3c7';
      for (const gx of [-13, 0, 13]) {
        ctx.beginPath();
        ctx.arc(gx, gx === 0 ? -9 : -6, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Name tag.
    ctx.save();
    ctx.font = `600 ${13 * ui}px "Segoe UI", Inter, system-ui, sans-serif`;
    const label = this.name;
    const h = 20 * ui;
    const width = ctx.measureText(label).width + 26 * ui;
    const tx = this.x - width / 2;
    const ty = this.y + r + 10;
    ctx.fillStyle = 'rgba(6, 18, 31, 0.72)';
    roundRect(ctx, tx, ty, width, h, h / 2);
    ctx.fill();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(tx + 10 * ui, ty + h / 2, 4 * ui, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#eef6fb';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, tx + 18 * ui, ty + h / 2 + 0.5);
    ctx.restore();
  }
}
