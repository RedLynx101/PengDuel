class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
        this.backgroundMusic = null;
    }

    async loadSound(name, url, volume = 1) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds[name] = { buffer: audioBuffer, volume };
        } catch (error) {
            console.error(`Unable to load sound '${name}':`, error);
        }
    }

    setVolume(name, volume) {
        if (this.sounds[name]) {
            this.sounds[name].volume = Math.max(0, Math.min(volume, 1));
        }
    }

    connectSource(source, volume) {
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
    }

    playSound(name) {
        const sound = this.sounds[name];
        if (!sound) return;

        const source = this.audioContext.createBufferSource();
        source.buffer = sound.buffer;
        this.connectSource(source, sound.volume);
        source.start();
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
    }

    playBackgroundMusic(name) {
        this.stopBackgroundMusic();
        const sound = this.sounds[name];
        if (!sound) return;

        const source = this.audioContext.createBufferSource();
        source.buffer = sound.buffer;
        source.loop = true;
        this.connectSource(source, sound.volume);
        source.start();
        this.backgroundMusic = source;
    }
}

const audioManager = new AudioManager();

audioManager.loadSound('splash', '/static/assets/splash.mp3', 0.55);
audioManager.loadSound('collision', '/static/assets/collision.mp3', 0.3);
audioManager.loadSound('beep', '/static/assets/beep.mp3', 0.18);
audioManager.loadSound('background', '/static/assets/iceberg.mp3', 0.12);
audioManager.loadSound('powerup', '/static/assets/powerup.mp3', 0.45);
