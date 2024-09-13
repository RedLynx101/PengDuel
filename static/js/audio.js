class AudioManager {
    constructor() {
        console.log('AudioManager: Initializing');
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
        this.backgroundMusic = null;
        console.log('AudioManager: Initialized successfully');
    }

    async loadSound(name, url) {
        console.log(`AudioManager: Loading sound '${name}' from ${url}`);
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds[name] = { buffer: audioBuffer };
            console.log(`AudioManager: Sound '${name}' loaded successfully`);
        } catch (error) {
            console.error(`AudioManager: Error loading sound '${name}':`, error);
        }
    }
    setVolume(name, volume) {
        console.log(`AudioManager: Setting volume for '${name}' to ${volume}`);
        if (this.sounds[name]) {
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            this.sounds[name].gainNode = gainNode;
        } else {
            console.warn(`AudioManager: Sound '${name}' not found`);
        }
    }

    playSound(name) {
        console.log(`AudioManager: Attempting to play sound '${name}'`);
        if (this.sounds[name]) {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[name].buffer;
            if (this.sounds[name].gainNode) {
                source.connect(this.sounds[name].gainNode);
                this.sounds[name].gainNode.connect(this.audioContext.destination);
            } else {
                source.connect(this.audioContext.destination);
            }
            source.start();
            console.log(`AudioManager: Sound '${name}' played successfully`);
        } else {
            console.warn(`AudioManager: Sound '${name}' not found`);
        }
    }


    stopBackgroundMusic() {
        console.log('AudioManager: Stopping background music');
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
    }
    playBackgroundMusic(name) {
        console.log(`AudioManager: Attempting to play background music '${name}'`);
        this.stopBackgroundMusic(); // Stop existing music
        if (this.sounds[name]) {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[name].buffer;
            source.connect(this.audioContext.destination);
            source.loop = true;
            source.start();
            this.backgroundMusic = source;
            console.log(`AudioManager: Background music '${name}' started successfully`);
        } else {
            console.warn(`AudioManager: Background music '${name}' not found`);
        }
    }
}

const audioManager = new AudioManager();

// Load sound effects
console.log('AudioManager: Loading sound effects');
audioManager.loadSound('splash', '/static/assets/splash.mp3');
audioManager.loadSound('collision', '/static/assets/collision.mp3').then(() => {
    audioManager.setVolume('collision', 2);
});
audioManager.loadSound('beep', '/static/assets/beep.mp3');
audioManager.loadSound('background', '/static/assets/iceberg.mp3');
audioManager.loadSound('powerup', '/static/assets/powerup.mp3');

