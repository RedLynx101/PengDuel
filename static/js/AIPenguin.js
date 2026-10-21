import { Penguin } from './Penguin.js';
import { settings, WORLD } from './config.js';

/**
 * A penguin that plays to win: it works its way between the opponent and the middle of the
 * iceberg, then charges outward; it backs off the edge when it is in danger and grabs a
 * power-up when one is closer to it than to the opponent.
 */
export class AIPenguin extends Penguin {
  constructor(options) {
    super(options);
    this.thinkTimer = 0;
    this.target = { x: options.x, y: options.y };
    this.strength = 0.82; // a little slower to react than a human
  }

  reset(x, y, facing) {
    super.reset(x, y, facing);
    this.thinkTimer = 0;
    this.target = { x, y };
  }

  think(opponent, powerUps) {
    this.thinkTimer -= 1;
    if (this.thinkTimer > 0) return;
    this.thinkTimer = 5 + Math.floor(Math.random() * 6);

    const R = settings.icebergRadius;
    const r = this.currentRadius;
    const myDist = Math.hypot(this.x - WORLD.cx, this.y - WORLD.cy);

    // Self-preservation first.
    if (myDist > R - r * 2.6) {
      this.target = { x: WORLD.cx, y: WORLD.cy };
      return;
    }

    // Take a power-up that is clearly ours.
    const orb = powerUps.find((p) => !p.taken);
    if (orb) {
      const mine = Math.hypot(orb.x - this.x, orb.y - this.y);
      const theirs = Math.hypot(orb.x - opponent.x, orb.y - opponent.y);
      if (mine < theirs * 0.6 && mine < R * 0.9) {
        this.target = { x: orb.x, y: orb.y };
        return;
      }
    }

    // Get between the opponent and the centre, then push outward through them.
    const ox = opponent.x - WORLD.cx;
    const oy = opponent.y - WORLD.cy;
    const oDist = Math.hypot(ox, oy) || 1;
    const ux = ox / oDist;
    const uy = oy / oDist;
    const lineUpX = opponent.x - ux * (r + opponent.currentRadius) * 1.4;
    const lineUpY = opponent.y - uy * (r + opponent.currentRadius) * 1.4;
    const lined = Math.hypot(this.x - lineUpX, this.y - lineUpY) < r * 1.6;
    const jitter = (Math.random() - 0.5) * r * 1.5;
    this.target = lined
      ? { x: opponent.x + ux * r * 2 + jitter, y: opponent.y + uy * r * 2 - jitter }
      : { x: lineUpX + jitter, y: lineUpY - jitter };
  }

  drive() {
    this.applyInput(this.target.x - this.x, this.target.y - this.y, this.strength);
  }
}
