import { WORLD, settings, DEFAULTS, STEP_MS, POWERUP, PALETTE } from './config.js';
import { Penguin } from './Penguin.js';
import { AIPenguin } from './AIPenguin.js';
import { PowerUp } from './PowerUp.js';
import { Effects } from './effects.js';
import { audio } from './audio.js';
import { drawWater, drawIceberg, drawDanger, drawHud, drawMenu, drawCountdown, drawRoundOver } from './render.js';

const COUNTDOWN_MS = 2100;
const AI_NAME = 'Frost (AI)';
const COLOR_NAMES = { '#3b82f6': 'Blue', '#f43f5e': 'Rose', '#22c55e': 'Green', '#f59e0b': 'Amber', '#a855f7': 'Violet', '#14b8a6': 'Teal', '#ec4899': 'Pink' };

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const $ = (id) => document.getElementById(id);
const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

let pixelScale = 1;
function sizeCanvas() {
  pixelScale = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = WORLD.width * pixelScale;
  canvas.height = WORLD.height * pixelScale;
}

const state = {
  phase: 'menu', // menu | countdown | playing | roundOver
  mode: 'single', // single | two
  players: [],
  powerUps: [],
  respawnAt: null,
  scores: {},
  colors: {},
  round: 0,
  countdown: 0,
  winner: null,
  loser: null,
  clock: 0,
  contact: false,
};
const effects = new Effects();
const keys = new Set();
let pointer = null;

// ---------- setup ----------

function readSetup() {
  const p1Name = ($('player1-name').value.trim() || 'Player 1').slice(0, 16);
  let p2Name = state.mode === 'single' ? AI_NAME : ($('player2-name').value.trim() || 'Player 2').slice(0, 16);
  if (p2Name === p1Name) p2Name = `${p2Name} 2`;
  return { p1Name, p2Name, p1Color: $('player1-color').value, p2Color: $('player2-color').value };
}

function spawnPlayers() {
  const setup = readSetup();
  const crowns = new Map(state.players.map((p) => [p.name, p.crowned]));
  const offset = settings.icebergRadius * 0.45;
  const p1 = new Penguin({ x: WORLD.cx - offset, y: WORLD.cy, color: setup.p1Color, name: setup.p1Name, facing: 0 });
  const Opponent = state.mode === 'single' ? AIPenguin : Penguin;
  const p2 = new Opponent({ x: WORLD.cx + offset, y: WORLD.cy, color: setup.p2Color, name: setup.p2Name, facing: Math.PI });
  p1.crowned = crowns.get(p1.name) ?? false;
  p2.crowned = crowns.get(p2.name) ?? false;
  state.players = [p1, p2];
}

function startRound() {
  audio.unlock();
  spawnPlayers();
  const [p1, p2] = state.players;
  for (const p of state.players) {
    state.scores[p.name] ??= 0;
    state.colors[p.name] = p.color;
  }
  state.powerUps = [];
  state.respawnAt = state.clock + 1800;
  state.round += 1;
  state.phase = 'countdown';
  state.countdown = COUNTDOWN_MS;
  state.winner = null;
  state.loser = null;
  state.contact = false;
  keys.clear();
  effects.clear();
  audio.stopMusic();
  audio.play('beep');
  $('start-game').textContent = 'Restart round';
  renderScoreboard();
  announce(`Round ${state.round}: ${p1.name} against ${p2.name}. Get ready.`);
  canvas.setAttribute('aria-label', `PengDuel round ${state.round} in progress`);
}

function endRound(loser, winner) {
  state.phase = 'roundOver';
  state.loser = loser;
  state.winner = winner;
  loser.out = true;
  for (const p of state.players) p.crowned = false;
  winner.crowned = true;
  state.scores[winner.name] = (state.scores[winner.name] ?? 0) + 1;
  effects.splash(loser.x, loser.y);
  audio.stopMusic();
  audio.play('splash');
  renderScoreboard();
  $('start-game').textContent = 'Next round';
  const tally = state.players.map((p) => `${p.name} ${state.scores[p.name]}`).join(', ');
  announce(`${winner.name} wins round ${state.round}. Score: ${tally}.`);
  canvas.setAttribute('aria-label', `PengDuel: ${winner.name} won round ${state.round}. ${tally}.`);
}

// ---------- simulation ----------

function collide(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 0.001;
  const reach = a.currentRadius + b.currentRadius;
  if (dist >= reach) {
    state.contact = false;
    return;
  }
  const nx = dx / dist;
  const ny = dy / dist;
  const total = a.mass + b.mass;
  const overlap = reach - dist;
  a.x -= nx * overlap * (b.mass / total);
  a.y -= ny * overlap * (b.mass / total);
  b.x += nx * overlap * (a.mass / total);
  b.y += ny * overlap * (a.mass / total);

  const approaching = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
  const impulse = settings.pushForce * 0.5 + Math.max(0, approaching) * 0.9;
  a.vx -= (nx * impulse) / a.mass;
  a.vy -= (ny * impulse) / a.mass;
  b.vx += (nx * impulse) / b.mass;
  b.vy += (ny * impulse) / b.mass;

  if (!state.contact) {
    effects.impact(a.x + nx * a.currentRadius, a.y + ny * a.currentRadius);
    audio.play('collision', Math.min(1.4, 0.5 + approaching / 6));
    state.contact = true;
  }
}

function collectPowerUps() {
  for (const orb of state.powerUps) {
    for (const p of state.players) {
      if (orb.taken) break;
      if (Math.hypot(p.x - orb.x, p.y - orb.y) < p.currentRadius + POWERUP.radius) {
        orb.taken = true;
        p.activatePowerUp(orb.type, state.clock);
        const color = orb.type === 'speed' ? '#fbbf24' : '#34d399';
        effects.burst(orb.x, orb.y, color, 18, 3, 34, 2.6);
        effects.label(p.x, p.y - p.currentRadius - 26, orb.type === 'speed' ? 'Speed!' : 'Grow!', color);
        audio.play('powerup');
        state.respawnAt = state.clock + POWERUP.respawnMs;
      }
    }
  }
  state.powerUps = state.powerUps.filter((orb) => !orb.taken);
  if (!state.powerUps.length && state.respawnAt !== null && state.clock >= state.respawnAt) {
    state.powerUps.push(new PowerUp(state.clock));
    state.respawnAt = null;
  }
}

function edgeDistance(p) {
  return Math.hypot(p.x - WORLD.cx, p.y - WORLD.cy) - (settings.icebergRadius - p.currentRadius * 0.25);
}

function readInput() {
  const [p1, p2] = state.players;
  const has = (k) => keys.has(k);
  const wasd = [(has('d') ? 1 : 0) - (has('a') ? 1 : 0), (has('s') ? 1 : 0) - (has('w') ? 1 : 0)];
  const arrows = [
    (has('arrowright') ? 1 : 0) - (has('arrowleft') ? 1 : 0),
    (has('arrowdown') ? 1 : 0) - (has('arrowup') ? 1 : 0),
  ];
  if (state.mode === 'single') {
    p1.applyInput(wasd[0] + arrows[0], wasd[1] + arrows[1]);
    p2.think(p1, state.powerUps);
    p2.drive();
  } else {
    p1.applyInput(...wasd);
    p2.applyInput(...arrows);
  }
  if (pointer) {
    const dx = pointer.x - p1.x;
    const dy = pointer.y - p1.y;
    if (Math.hypot(dx, dy) > p1.currentRadius * 0.5) p1.applyInput(dx, dy);
  }
}

function fixedUpdate() {
  state.clock += STEP_MS;
  effects.step();

  if (state.phase === 'countdown') {
    const before = Math.ceil(state.countdown / 700);
    state.countdown -= STEP_MS;
    const after = Math.ceil(state.countdown / 700);
    if (after < before && after > 0) audio.play('beep');
    if (state.countdown <= 0) {
      state.phase = 'playing';
      audio.play('beep', 1.6);
      audio.startMusic();
      announce('Push!');
    }
    return;
  }

  if (state.phase === 'playing') {
    readInput();
    for (const p of state.players) p.step(state.clock);
    collide(state.players[0], state.players[1]);
    collectPowerUps();
    const out = state.players
      .map((p) => ({ p, beyond: edgeDistance(p) }))
      .filter((o) => o.beyond > 0)
      .sort((a, b) => b.beyond - a.beyond);
    if (out.length) {
      const loser = out[0].p;
      endRound(loser, state.players.find((p) => p !== loser));
    }
    return;
  }

  if (state.phase === 'roundOver') {
    for (const p of state.players) p.step(state.clock);
    if (state.loser) state.loser.sink = Math.min(1, state.loser.sink + 0.03);
  }
}

// ---------- drawing ----------

function uiScale() {
  const shown = canvas.getBoundingClientRect().width || WORLD.width;
  return Math.min(1.9, Math.max(1, (0.72 * WORLD.width) / shown));
}

function render() {
  const ui = uiScale();
  ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
  const [sx, sy] = effects.shakeOffset();
  ctx.translate(sx, sy);

  drawWater(ctx, state.clock);
  if (state.loser) state.loser.draw(ctx, state.clock); // sinking, below the ice edge
  drawIceberg(ctx, state.clock, pixelScale);
  if (state.phase === 'playing') for (const p of state.players) drawDanger(ctx, p);
  for (const orb of state.powerUps) orb.draw(ctx, state.clock);
  const standing = state.players.filter((p) => p !== state.loser).sort((a, b) => a.y - b.y);
  for (const p of standing) p.draw(ctx, state.clock);
  for (const p of standing) p.drawLabels(ctx, state.clock, ui);
  effects.draw(ctx);

  ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
  const hudBottom =
    state.round > 0 ? drawHud(ctx, { players: state.players, scores: state.scores, round: state.round, ui }) : 0;
  if (state.phase === 'menu') drawMenu(ctx, isTouch, ui);
  if (state.phase === 'countdown') drawCountdown(ctx, state.countdown, ui);
  if (state.phase === 'roundOver' && state.winner && state.loser.sink >= 0.6) {
    drawRoundOver(ctx, state.winner, isTouch, hudBottom + 10, ui);
  }
}

let last = performance.now();
let accumulator = 0;
function frame(now) {
  accumulator += Math.min(100, now - last); // a background tab never fast-forwards
  last = now;
  while (accumulator >= STEP_MS) {
    fixedUpdate();
    accumulator -= STEP_MS;
  }
  render();
  requestAnimationFrame(frame);
}

// ---------- page UI ----------

function announce(text) {
  $('status-line').textContent = text;
}

function renderScoreboard() {
  const list = $('leaderboard');
  const entries = Object.entries(state.scores).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    list.innerHTML = '<li class="empty">No rounds yet.</li>';
    return;
  }
  const crowned = new Set(state.players.filter((p) => p.crowned).map((p) => p.name));
  list.replaceChildren(
    ...entries.map(([name, wins]) => {
      const li = document.createElement('li');
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.setProperty('--dot', state.colors[name] ?? '#94a3b8');
      const label = document.createElement('span');
      label.className = 'name';
      label.textContent = name;
      li.append(dot, label);
      if (crowned.has(name)) {
        const crown = document.createElement('span');
        crown.className = 'crown';
        crown.textContent = 'Champ';
        li.append(crown);
      }
      const count = document.createElement('span');
      count.className = 'wins';
      count.textContent = String(wins);
      count.setAttribute('aria-label', `${wins} ${wins === 1 ? 'win' : 'wins'}`);
      li.append(count);
      return li;
    }),
  );
}

function refreshPreview() {
  if (state.phase === 'menu') spawnPlayers();
}

function buildSwatches() {
  for (const group of document.querySelectorAll('.swatches')) {
    const input = $(group.dataset.target);
    for (const color of PALETTE) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'swatch';
      button.style.setProperty('--swatch', color);
      button.dataset.color = color;
      button.setAttribute('role', 'radio');
      button.setAttribute('aria-label', COLOR_NAMES[color] ?? color);
      button.addEventListener('click', () => {
        input.value = color;
        syncSwatches();
        refreshPreview();
      });
      group.append(button);
    }
  }
  syncSwatches();
}

function syncSwatches() {
  const chosen = { 'player1-color': $('player1-color').value, 'player2-color': $('player2-color').value };
  for (const group of document.querySelectorAll('.swatches')) {
    const mine = chosen[group.dataset.target];
    const other = Object.entries(chosen).find(([key]) => key !== group.dataset.target)[1];
    for (const button of group.querySelectorAll('.swatch')) {
      const selected = button.dataset.color === mine;
      button.setAttribute('aria-checked', String(selected));
      button.tabIndex = selected ? 0 : -1;
      button.disabled = button.dataset.color === other;
    }
  }
}

function setMode(mode) {
  state.mode = mode;
  $('single-player').setAttribute('aria-pressed', String(mode === 'single'));
  $('two-player').setAttribute('aria-pressed', String(mode === 'two'));
  $('player2-name').hidden = mode === 'single';
  $('player2-label').textContent = mode === 'single' ? 'AI opponent' : 'Player 2';
  $('mode-description').textContent =
    mode === 'single' ? 'You against a penguin that plays to win.' : 'Two players share one keyboard: WASD against the arrow keys.';
  if (state.phase !== 'menu') {
    state.phase = 'menu';
    audio.stopMusic();
    $('start-game').textContent = 'Start round';
  }
  state.loser = null;
  refreshPreview();
  announce(mode === 'single' ? 'Mode: vs AI. Press Start round.' : 'Mode: two players. Press Start round.');
}

const SLIDERS = [
  ['iceberg-radius', 'icebergRadius', (v) => `${v}`],
  ['penguin-radius', 'penguinRadius', (v) => `${v}`],
  ['push-force', 'pushForce', (v) => v.toFixed(1)],
  ['friction', 'friction', (v) => v.toFixed(3)],
];

function syncSliders() {
  for (const [id, key, format] of SLIDERS) {
    $(id).value = settings[key];
    document.querySelector(`output[for="${id}"]`).textContent = format(settings[key]);
  }
}

function wireUi() {
  buildSwatches();
  syncSliders();
  setMode('single');

  $('single-player').addEventListener('click', () => setMode('single'));
  $('two-player').addEventListener('click', () => setMode('two'));
  $('start-game').addEventListener('click', startRound);
  $('player1-name').addEventListener('input', refreshPreview);
  $('player2-name').addEventListener('input', refreshPreview);
  $('reset-scores').addEventListener('click', () => {
    state.scores = {};
    for (const p of state.players) p.crowned = false;
    renderScoreboard();
    announce('Scores reset.');
  });

  for (const [id, key, format] of SLIDERS) {
    $(id).addEventListener('input', (event) => {
      settings[key] = Number(event.target.value);
      document.querySelector(`output[for="${id}"]`).textContent = format(settings[key]);
      refreshPreview();
    });
  }
  $('reset-constants').addEventListener('click', () => {
    Object.assign(settings, DEFAULTS);
    syncSliders();
    refreshPreview();
  });

  const mute = $('mute-toggle');
  const syncMute = () => {
    mute.setAttribute('aria-pressed', String(audio.muted));
    mute.setAttribute('aria-label', audio.muted ? 'Unmute sound' : 'Mute sound');
  };
  syncMute();
  mute.addEventListener('click', () => {
    audio.unlock();
    audio.setMuted(!audio.muted);
    if (!audio.muted && state.phase === 'playing') audio.startMusic();
    syncMute();
  });
}

// ---------- input ----------

const GAME_KEYS = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);

document.addEventListener('keydown', (event) => {
  if (event.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
  const key = event.key.toLowerCase();
  if (key === ' ' || key === 'enter') {
    if (event.target.closest?.('button, a, summary')) return; // the control handles it
    event.preventDefault();
    if (state.phase === 'menu' || state.phase === 'roundOver') startRound();
    return;
  }
  if (!GAME_KEYS.has(key)) return;
  if (key.startsWith('arrow')) event.preventDefault();
  keys.add(key);
});
document.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => keys.clear());

function toWorld(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * WORLD.width,
    y: ((event.clientY - rect.top) / rect.height) * WORLD.height,
  };
}

canvas.addEventListener('pointerdown', (event) => {
  audio.unlock();
  if (state.phase === 'menu' || state.phase === 'roundOver') {
    startRound();
    return;
  }
  if (event.pointerType === 'mouse') return; // keyboard steers on desktop
  pointer = toWorld(event);
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (pointer) pointer = toWorld(event);
});
for (const type of ['pointerup', 'pointercancel']) {
  canvas.addEventListener(type, () => {
    pointer = null;
  });
}

// ---------- boot ----------

sizeCanvas();
window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener?.('change', sizeCanvas);
wireUi();
requestAnimationFrame((now) => {
  last = now;
  requestAnimationFrame(frame);
});
