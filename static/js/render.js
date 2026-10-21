import { WORLD, settings } from './config.js';

const FONT = '"Segoe UI", Inter, system-ui, sans-serif';

/** Lighten (amount > 0) or darken (amount < 0) a #rrggbb colour. */
export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const target = amount > 0 ? 255 : 0;
    return Math.round(c + (target - c) * Math.abs(amount));
  });
  return `rgb(${channels.join(',')})`;
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------- water ----------

export function drawWater(ctx, clockMs) {
  const sea = ctx.createLinearGradient(0, 0, 0, WORLD.height);
  sea.addColorStop(0, '#0e4a72');
  sea.addColorStop(1, '#072c47');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  const t = clockMs / 1000;
  ctx.save();
  ctx.lineWidth = 1.5;
  for (let row = 0; row < 16; row += 1) {
    const y = 18 + row * 38;
    ctx.strokeStyle = `rgba(186, 230, 253, ${0.05 + (row % 3) * 0.015})`;
    ctx.beginPath();
    for (let x = -20; x <= WORLD.width + 20; x += 20) {
      const wave = Math.sin(x / 55 + t * 0.9 + row * 1.7) * 4 + Math.sin(x / 23 - t * 1.4 + row) * 1.5;
      if (x === -20) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- iceberg (cached) ----------

let icebergCache = null;
let cachedRadius = 0;
let cachedScale = 0;

function buildIceberg(radius, pixelScale) {
  const pad = 40;
  const size = (radius + pad) * 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(size * pixelScale);
  canvas.height = Math.ceil((size + 24) * pixelScale);
  const ctx = canvas.getContext('2d');
  ctx.scale(pixelScale, pixelScale);
  const c = radius + pad;

  // Underwater skirt.
  ctx.fillStyle = 'rgba(125, 211, 252, 0.18)';
  ctx.beginPath();
  ctx.ellipse(c, c + 16, radius * 1.08, radius * 1.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ice wall (gives the floe some height).
  const wall = ctx.createLinearGradient(0, c - radius, 0, c + radius + 14);
  wall.addColorStop(0, '#9ccfe6');
  wall.addColorStop(1, '#4f98bd');
  ctx.fillStyle = wall;
  ctx.beginPath();
  ctx.arc(c, c + 12, radius, 0, Math.PI * 2);
  ctx.fill();

  // Top surface.
  const top = ctx.createRadialGradient(c - radius * 0.3, c - radius * 0.35, radius * 0.1, c, c, radius);
  top.addColorStop(0, '#ffffff');
  top.addColorStop(0.65, '#eef8fd');
  top.addColorStop(1, '#cfe7f3');
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.arc(c, c, radius, 0, Math.PI * 2);
  ctx.fill();

  // Rim highlight.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(c, c, radius - 1, Math.PI * 1.05, Math.PI * 1.85);
  ctx.stroke();

  // A few cracks and snow patches, seeded so they never flicker.
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  ctx.strokeStyle = 'rgba(120, 170, 200, 0.35)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 7; i += 1) {
    const a = rand() * Math.PI * 2;
    let x = c + Math.cos(a) * radius * (0.55 + rand() * 0.35);
    let y = c + Math.sin(a) * radius * (0.55 + rand() * 0.35);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 4; s += 1) {
      x += (rand() - 0.5) * 26;
      y += (rand() - 0.5) * 26;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  for (let i = 0; i < 9; i += 1) {
    const a = rand() * Math.PI * 2;
    const d = rand() * radius * 0.8;
    ctx.beginPath();
    ctx.ellipse(c + Math.cos(a) * d, c + Math.sin(a) * d, 8 + rand() * 18, 4 + rand() * 8, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  return { canvas, offset: c };
}

export function drawIceberg(ctx, clockMs, pixelScale) {
  const radius = settings.icebergRadius;
  if (!icebergCache || cachedRadius !== radius || cachedScale !== pixelScale) {
    icebergCache = buildIceberg(radius, pixelScale);
    cachedRadius = radius;
    cachedScale = pixelScale;
  }
  const { canvas, offset } = icebergCache;
  ctx.drawImage(canvas, WORLD.cx - offset, WORLD.cy - offset, canvas.width / pixelScale, canvas.height / pixelScale);

  // Foam at the waterline.
  const t = clockMs / 1000;
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 14]);
  ctx.lineDashOffset = -t * 18;
  ctx.beginPath();
  ctx.arc(WORLD.cx, WORLD.cy + 12, radius + 6 + Math.sin(t * 2) * 1.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Red glow on the rim near a penguin that is close to the edge. */
export function drawDanger(ctx, penguin) {
  const R = settings.icebergRadius;
  const dx = penguin.x - WORLD.cx;
  const dy = penguin.y - WORLD.cy;
  const dist = Math.hypot(dx, dy);
  const margin = R - dist;
  const zone = penguin.currentRadius * 2.4;
  if (margin > zone) return;
  const strength = Math.min(1, 1 - margin / zone);
  const angle = Math.atan2(dy, dx);
  ctx.save();
  ctx.strokeStyle = `rgba(251, 113, 133, ${0.25 + strength * 0.55})`;
  ctx.lineWidth = 4 + strength * 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(WORLD.cx, WORLD.cy, R - 2, angle - 0.32, angle + 0.32);
  ctx.stroke();
  ctx.restore();
}

// ---------- HUD and overlays ----------
// `ui` scales text and chips up when the canvas is shown small (phones), so labels stay legible.

function chip(ctx, x, y, align, color, name, wins, crowned, ui) {
  ctx.save();
  ctx.font = `700 ${14 * ui}px ${FONT}`;
  const label = name.length > 14 ? `${name.slice(0, 13)}…` : name;
  const nameW = ctx.measureText(label).width;
  ctx.font = `800 ${18 * ui}px ${FONT}`;
  const winsW = ctx.measureText(String(wins)).width;
  const h = 34 * ui;
  const w = nameW + winsW + 48 * ui;
  const left = align === 'left' ? x : x - w;
  ctx.fillStyle = 'rgba(6, 18, 31, 0.66)';
  roundRect(ctx, left, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(left + 17 * ui, y + h / 2, 6 * ui, 0, Math.PI * 2);
  ctx.fill();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#eef6fb';
  ctx.font = `700 ${14 * ui}px ${FONT}`;
  ctx.fillText(label, left + 30 * ui, y + h / 2 + 0.5);
  ctx.font = `800 ${18 * ui}px ${FONT}`;
  ctx.fillStyle = crowned ? '#fbbf24' : '#eef6fb';
  ctx.fillText(String(wins), left + 36 * ui + nameW, y + h / 2 + 0.5);
  ctx.restore();
  return y + h;
}

export function drawHud(ctx, { players, scores, round, ui = 1 }) {
  if (!players.length) return 0;
  const [p1, p2] = players;
  const bottom = chip(ctx, 14, 12, 'left', p1.color, p1.name, scores[p1.name] ?? 0, p1.crowned, ui);
  chip(ctx, WORLD.width - 14, 12, 'right', p2.color, p2.name, scores[p2.name] ?? 0, p2.crowned, ui);
  if (round > 0 && ui < 1.3) {
    ctx.save();
    ctx.font = `700 ${12 * ui}px ${FONT}`;
    ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`ROUND ${round}`, WORLD.width / 2, 12 + 17 * ui);
    ctx.restore();
  }
  return bottom;
}

/** A compact title card near the top of the arena, so the penguins stay visible. */
function card(ctx, top, title, subtitle, color, ui) {
  ctx.save();
  const titleSize = 34 * ui;
  const subSize = 15 * ui;
  ctx.font = `800 ${titleSize}px ${FONT}`;
  const titleW = ctx.measureText(title).width;
  ctx.font = `500 ${subSize}px ${FONT}`;
  const subW = ctx.measureText(subtitle).width;
  const w = Math.min(WORLD.width - 24, Math.max(titleW, subW) + 56 * ui);
  const h = titleSize + subSize + 40 * ui;
  const left = (WORLD.width - w) / 2;
  ctx.fillStyle = 'rgba(4, 14, 26, 0.74)';
  ctx.strokeStyle = 'rgba(148, 205, 235, 0.22)';
  ctx.lineWidth = 1;
  roundRect(ctx, left, top, w, h, 18 * ui);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.font = `800 ${titleSize}px ${FONT}`;
  ctx.fillText(title, WORLD.width / 2, top + 14 * ui + titleSize * 0.85, w - 24);
  ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
  ctx.font = `500 ${subSize}px ${FONT}`;
  ctx.fillText(subtitle, WORLD.width / 2, top + h - 16 * ui, w - 24);
  ctx.restore();
}

export function drawMenu(ctx, touch, ui = 1) {
  card(
    ctx,
    16,
    'PengDuel',
    touch ? 'Tap Start round, then drag on the ice to steer' : 'Press Space to start · first one in the sea loses',
    '#eef6fb',
    ui,
  );
}

export function drawCountdown(ctx, msLeft, ui = 1) {
  const n = Math.ceil(msLeft / 700);
  const text = n > 0 ? String(n) : 'Push!';
  const phase = (msLeft % 700) / 700;
  const scale = (1 + phase * 0.35) * Math.min(ui, 1.4);
  ctx.save();
  ctx.translate(WORLD.width / 2, WORLD.cy);
  ctx.scale(scale, scale);
  ctx.globalAlpha = n > 0 ? 0.35 + phase * 0.65 : 1;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 96px ${FONT}`;
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(6, 18, 31, 0.55)';
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

export function drawRoundOver(ctx, winner, touch, top, ui = 1) {
  card(
    ctx,
    top,
    `${winner.name} wins!`,
    touch ? 'Tap the ice to play again' : 'Press Space to play again',
    shade(winner.color, 0.45),
    ui,
  );
}
