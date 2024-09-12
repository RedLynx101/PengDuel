class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
    }

    async loadSound(name, url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.sounds[name] = audioBuffer;
    }

    playSound(name) {
        if (this.sounds[name]) {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[name];
            source.connect(this.audioContext.destination);
            source.start();
        }
    }
}

const audioManager = new AudioManager();

// Load sound effects
audioManager.loadSound('splash', '/static/assets/splash.mp3');
audioManager.loadSound('collision', '/static/assets/collision.mp3');
