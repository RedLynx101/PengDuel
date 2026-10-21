// Shared game settings. `settings` is mutable so the physics sliders can tune a live session.

export const WORLD = Object.freeze({ width: 800, height: 600, cx: 400, cy: 316 });

export const DEFAULTS = Object.freeze({
  icebergRadius: 230,
  penguinRadius: 22,
  pushForce: 6,
  friction: 0.975,
});

export const settings = { ...DEFAULTS };

// Physics runs at a fixed 60 steps per second, independent of the display's refresh rate.
export const STEP_MS = 1000 / 60;

export const POWERUP = Object.freeze({
  radius: 15,
  durationMs: 10000,
  respawnMs: 5000,
});

export const PALETTE = Object.freeze([
  '#3b82f6', // blue
  '#f43f5e', // rose
  '#22c55e', // green
  '#f59e0b', // amber
  '#a855f7', // violet
  '#14b8a6', // teal
  '#ec4899', // pink
]);

export const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
