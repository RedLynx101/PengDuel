import { reducedMotion } from './config.js';

const FONT = '"Segoe UI", Inter, system-ui, sans-serif';

/** Short-lived particles, ripples, floating labels and screen shake. */
export class Effects {
  constructor() {
    this.particles = [];
    this.ripples = [];
    this.labels = [];
    this.shakeTime = 0;
    this.shakeStrength = 0;
  }

  clear() {
    this.particles.length = 0;
    this.ripples.length = 0;
    this.labels.length = 0;
    this.shakeTime = 0;
  }

  burst(x, y, color, count, speed, life = 40, size = 3) {
    const n = reducedMotion ? Math.ceil(count / 3) : count;
    for (let i = 0; i < n; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.4 + Math.random() * 0.8);
      this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, maxLife: life, size: size * (0.6 + Math.random() * 0.8), color });
    }
  }

  impact(x, y) {
    this.burst(x, y, 'rgba(224, 242, 254, 0.95)', 10, 3.2, 22, 2.4);
    this.shake(4, 10);
  }

  splash(x, y) {
    this.burst(x, y, 'rgba(186, 230, 253, 0.95)', 34, 4.6, 55, 3.4);
    for (let i = 0; i < 3; i += 1) this.ripples.push({ x, y, r: 6 + i * 10, life: 70 + i * 14, maxLife: 70 + i * 14 });
    this.shake(9, 24);
  }

  label(x, y, text, color) {
    this.labels.push({ x, y, text, color, life: 60, maxLife: 60 });
  }

  shake(strength, steps) {
    if (reducedMotion) return;
    this.shakeStrength = Math.max(this.shakeStrength, strength);
    this.shakeTime = Math.max(this.shakeTime, steps);
  }

  shakeOffset() {
    if (this.shakeTime <= 0) return [0, 0];
    const s = this.shakeStrength * (this.shakeTime / 24);
    return [(Math.random() - 0.5) * s, (Math.random() - 0.5) * s];
  }

  step() {
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy = p.vy * 0.94 + 0.05;
      p.life -= 1;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const r of this.ripples) {
      r.r += 1.4;
      r.life -= 1;
    }
    this.ripples = this.ripples.filter((r) => r.life > 0);
    for (const l of this.labels) {
      l.y -= 0.6;
      l.life -= 1;
    }
    this.labels = this.labels.filter((l) => l.life > 0);
    if (this.shakeTime > 0) this.shakeTime -= 1;
    else this.shakeStrength = 0;
  }

  draw(ctx) {
    ctx.save();
    for (const r of this.ripples) {
      ctx.globalAlpha = (r.life / r.maxLife) * 0.7;
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.r, r.r * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const p of this.particles) {
      ctx.globalAlpha = Math.min(1, p.life / p.maxLife + 0.2);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.textAlign = 'center';
    ctx.font = `800 16px ${FONT}`;
    for (const l of this.labels) {
      ctx.globalAlpha = Math.min(1, (l.life / l.maxLife) * 1.6);
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(6, 18, 31, 0.6)';
      ctx.strokeText(l.text, l.x, l.y);
      ctx.fillStyle = l.color;
      ctx.fillText(l.text, l.x, l.y);
    }
    ctx.restore();
  }
}
