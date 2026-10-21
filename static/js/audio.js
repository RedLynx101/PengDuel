// Small Web Audio wrapper. Sounds load lazily, play only after a user gesture unlocks the
// context, and respect a mute preference remembered in this browser.

const SOUNDS = {
  splash: ['static/assets/splash.mp3', 0.55],
  collision: ['static/assets/collision.mp3', 0.28],
  beep: ['static/assets/beep.mp3', 0.15],
  background: ['static/assets/iceberg.mp3', 0.1],
  powerup: ['static/assets/powerup.mp3', 0.45],
};

const MUTE_KEY = 'pengduel:muted';

class AudioManager {
  constructor() {
    this.context = null;
    this.buffers = {};
    this.music = null;
    this.loading = null;
    this.muted = false;
    try {
      this.muted = window.localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      this.muted = false;
    }
  }

  /** Create (or resume) the audio context. Call from a user gesture. */
  unlock() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!this.context) this.context = new AudioContextClass();
    if (this.context.state === 'suspended') this.context.resume().catch(() => {});
    if (!this.loading) this.loading = this.loadAll();
  }

  async loadAll() {
    await Promise.all(
      Object.entries(SOUNDS).map(async ([name, [url]]) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.arrayBuffer();
          this.buffers[name] = await this.context.decodeAudioData(data);
        } catch (error) {
          console.warn(`PengDuel: sound '${name}' unavailable`, error);
        }
      }),
    );
  }

  setMuted(muted) {
    this.muted = muted;
    try {
      window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
      /* storage may be unavailable; the toggle still works for this visit */
    }
    if (muted) this.stopMusic();
  }

  play(name, volumeScale = 1) {
    if (this.muted || !this.context || !this.buffers[name]) return null;
    const source = this.context.createBufferSource();
    source.buffer = this.buffers[name];
    const gain = this.context.createGain();
    gain.gain.value = SOUNDS[name][1] * volumeScale;
    source.connect(gain).connect(this.context.destination);
    source.start();
    return source;
  }

  startMusic() {
    this.stopMusic();
    const source = this.play('background');
    if (source) {
      source.loop = true;
      this.music = source;
    }
  }

  stopMusic() {
    if (this.music) {
      try {
        this.music.stop();
      } catch {
        /* already stopped */
      }
      this.music = null;
    }
  }
}

export const audio = new AudioManager();
