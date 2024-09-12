const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ICEBERG_RADIUS = 250;
const PENGUIN_RADIUS = 20;
const PUSH_FORCE = 2.5;
const FRICTION = 0.98;
const POWERUP_RADIUS = 15;
const POWERUP_DURATION = 5000; // 5 seconds

let gameState = 'start';
let player1, player2;
let winner = null;
let gameMode = 'twoPlayer';
let powerUps = [];

class Penguin {
    constructor(x, y, color, name) {
        console.log(`Penguin constructor called for ${name}`);
        this.x = x;
        this.y = y;
        this.color = color;
        this.name = name;
        this.vx = 0;
        this.vy = 0;
        this.crowned = false;
        this.mass = 1;
        this.powerUpActive = false;
        this.powerUpType = null;
        this.powerUpEndTime = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= FRICTION;
        this.vy *= FRICTION;

        const distanceFromCenter = Math.sqrt((this.x - canvas.width/2)**2 + (this.y - canvas.height/2)**2);
        if (distanceFromCenter > ICEBERG_RADIUS - PENGUIN_RADIUS) {
            gameState = 'gameOver';
            winner = this === player1 ? player2 : player1;
            player1.crowned = false;
            player2.crowned = false;
            winner.crowned = true;
            audioManager.playSound('splash');
        }

        // Check if power-up has expired
        if (this.powerUpActive && Date.now() > this.powerUpEndTime) {
            this.deactivatePowerUp();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, PENGUIN_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        // Draw name
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y + PENGUIN_RADIUS + 20);

        // Draw crown if crowned
        if (this.crowned) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - PENGUIN_RADIUS - 10);
            ctx.lineTo(this.x - 15, this.y - PENGUIN_RADIUS + 5);
            ctx.lineTo(this.x + 15, this.y - PENGUIN_RADIUS + 5);
            ctx.closePath();
            ctx.fillStyle = 'gold';
            ctx.fill();
        }

        // Draw power-up indicator
        if (this.powerUpActive) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, PENGUIN_RADIUS + 5, 0, Math.PI * 2);
            ctx.strokeStyle = this.powerUpType === 'speed' ? 'yellow' : 'green';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    activatePowerUp(type) {
        this.powerUpActive = true;
        this.powerUpType = type;
        this.powerUpEndTime = Date.now() + POWERUP_DURATION;

        if (type === 'speed') {
            this.vx *= 1.5;
            this.vy *= 1.5;
        } else if (type === 'size') {
            this.mass *= 1.5;
        }
    }

    deactivatePowerUp() {
        this.powerUpActive = false;
        if (this.powerUpType === 'speed') {
            this.vx /= 1.5;
            this.vy /= 1.5;
        } else if (this.powerUpType === 'size') {
            this.mass /= 1.5;
        }
        this.powerUpType = null;
    }
}

class AIPenguin extends Penguin {
    constructor(x, y, color, name) {
        super(x, y, color, name);
        this.initialX = x;
        this.initialY = y;
        this.initialAcceleration = 0.1;
        this.initialMaxSpeed = 1.2;
        this.reset();
    }
    update() {
        super.update();
        this.updateTarget();
        this.moveTowardsTarget();
    }
    updateTarget() {
        if (Math.random() < 0.55) {  // 55% of the time, target the player
            const offsetX = (Math.random() - 0.5) * PENGUIN_RADIUS * 8;
            const offsetY = (Math.random() - 0.5) * PENGUIN_RADIUS * 8;
            this.targetX = player1.x + offsetX;
            this.targetY = player1.y + offsetY;
        } else {  // 45% of the time, choose a random point on the iceberg
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * (ICEBERG_RADIUS - PENGUIN_RADIUS);
            this.targetX = canvas.width / 2 + Math.cos(angle) * distance;
            this.targetY = canvas.height / 2 + Math.sin(angle) * distance;
        }
    }
    moveTowardsTarget() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only apply movement if the distance is significant
        if (distance > 1) {
            // Normalize direction vector
            const vx = (dx / distance) * this.acceleration;
            const vy = (dy / distance) * this.acceleration;

            // Add acceleration to the current velocity
            this.vx += vx;
            this.vy += vy;

            // Calculate the current speed
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

            // Ensure the AI doesn't exceed the maximum speed
            if (currentSpeed > this.maxSpeed) {
                const scale = this.maxSpeed / currentSpeed;
                this.vx *= scale; // Scale down the velocity proportionally
                this.vy *= scale;
            }
        }
        console.log(`AI Speed: ${Math.sqrt(this.vx * this.vx + this.vy * this.vy)}`);
    }


    reset() {
        console.log('Resetting AIPenguin');
        this.x = this.initialX;
        this.y = this.initialY;
        this.vx = 0; // Reset velocity to zero
        this.vy = 0; // Reset velocity to zero
        this.acceleration = this.initialAcceleration;  // Ensure acceleration is reset
        this.maxSpeed = this.initialMaxSpeed;          // Ensure max speed is reset
        console.log(`AIPenguin reset - Position: (${this.x}, ${this.y}), Acceleration: ${this.acceleration}, Max Speed: ${this.maxSpeed}`);
    }
}

class PowerUp {
    constructor() {
        this.spawn();
    }

    spawn() {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (ICEBERG_RADIUS - POWERUP_RADIUS - 20); // Keep power-ups away from the edge
        this.x = canvas.width / 2 + Math.cos(angle) * distance;
        this.y = canvas.height / 2 + Math.sin(angle) * distance;
        this.type = Math.random() < 0.5 ? 'speed' : 'size';
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, POWERUP_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = this.type === 'speed' ? 'yellow' : 'green';
        ctx.fill();
        ctx.closePath();
    }
}

function init() {
    console.log('Game initialization started');
    const player1Name = document.getElementById('player1-name').value || 'Player 1';
    const player2Name = gameMode === 'singlePlayer' ? 'AI Penguin' : (document.getElementById('player2-name').value || 'Player 2');

    console.log(`Initializing players: ${player1Name} and ${player2Name}`);

    const prevPlayer1Crowned = player1 ? player1.crowned : false;
    const prevPlayer2Crowned = player2 ? player2.crowned : false;

    player1 = new Penguin(canvas.width/2 - 50, canvas.height/2, 'blue', player1Name);
    player1.vx = 0;
    player1.vy = 0;
    
    if (gameMode === 'singlePlayer') {
        player2 = new AIPenguin(canvas.width/2 + 50, canvas.height/2, 'red', player2Name);
        player2.reset();
    } else {
        player2 = new Penguin(canvas.width/2 + 50, canvas.height/2, 'red', player2Name);
        player2.vx = 0;
        player2.vy = 0;
    }

    player1.crowned = prevPlayer1Crowned;
    player2.crowned = prevPlayer2Crowned;

    gameState = 'playing';
    console.log('Game state set to:', gameState);

    document.getElementById('player-inputs').style.display = 'none';
    document.getElementById('restart-game').style.display = 'none';
    console.log('Game initialized with players:', player1Name, 'and', player2Name);

    console.log('Stopping background music');
    audioManager.stopBackgroundMusic();
    console.log('Attempting to start background music');
    audioManager.playBackgroundMusic('background');

    // Set collision sound volume
    console.log('Setting collision sound volume');
    audioManager.setVolume('collision', 2);

    // Initialize power-ups
    powerUps = [new PowerUp()];

    console.log('Starting game loop');
    gameLoop();
}

function drawIceberg() {
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, ICEBERG_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}

function update() {
    if (gameState === 'playing') {
        player1.update();
        player2.update();

        const dx = player2.x - player1.x;
        const dy = player2.y - player1.y;
        const distance = Math.sqrt(dx*dx + dy*dy);

        if (distance < PENGUIN_RADIUS * 2) {
            const angle = Math.atan2(dy, dx);
            const tx = player1.x + Math.cos(angle) * PENGUIN_RADIUS * 2;
            const ty = player1.y + Math.sin(angle) * PENGUIN_RADIUS * 2;

            player2.x = tx;
            player2.y = ty;

            const push = PUSH_FORCE / distance;
            const player1Mass = player1.mass || 1;
            const player2Mass = player2.mass || 1;

            player2.vx += dx * push / player2Mass;
            player2.vy += dy * push / player2Mass;
            player1.vx -= dx * push / player1Mass;
            player1.vy -= dy * push / player1Mass;

            audioManager.playSound('collision');
            audioManager.playSound('beep');
        }

        // Check for power-up collisions
        powerUps.forEach((powerUp, index) => {
            [player1, player2].forEach(player => {
                const dx = player.x - powerUp.x;
                const dy = player.y - powerUp.y;
                const distance = Math.sqrt(dx*dx + dy*dy);

                if (distance < PENGUIN_RADIUS + POWERUP_RADIUS) {
                    player.activatePowerUp(powerUp.type);
                    powerUps.splice(index, 1);
                    setTimeout(() => powerUps.push(new PowerUp()), 5000); // Respawn power-up after 5 seconds
                }
            });
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawIceberg();
    if (player1 && player2) {
        player1.draw();
        player2.draw();
    }

    // Draw power-ups
    powerUps.forEach(powerUp => powerUp.draw());

    if (gameState === 'gameOver') {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${winner.name} wins!`, canvas.width/2, 50);
        document.getElementById('restart-game').style.display = 'block';
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    console.log('Restarting game');
    gameState = 'start';

    if (player1) {
        player1.vx = 0;
        player1.vy = 0;
    }

    if (player2 instanceof AIPenguin) {
        player2.reset(); // This already resets acceleration, maxSpeed, vx, vy
    } else if (player2) {
        player2.vx = 0;
        player2.vy = 0;
    }

    // Reset velocities and acceleration for AI
    if (player2 instanceof AIPenguin) {
        player2.vx = 0;
        player2.vy = 0;
        player2.acceleration = player2.initialAcceleration;
        player2.maxSpeed = player2.initialMaxSpeed;
    }

    // Reset power-ups
    powerUps = [new PowerUp()];

    document.getElementById('player-inputs').style.display = 'block';
    document.getElementById('restart-game').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded, setting up event listeners');

    document.addEventListener('keydown', (e) => {
        if (gameState === 'playing') {
            switch(e.key) {
                case 'w': player1.vy -= 1; break;
                case 's': player1.vy += 1; break;
                case 'a': player1.vx -= 1; break;
                case 'd': player1.vx += 1; break;
                case 'ArrowUp': if (gameMode === 'twoPlayer') player2.vy -= 1; break;
                case 'ArrowDown': if (gameMode === 'twoPlayer') player2.vy += 1; break;
                case 'ArrowLeft': if (gameMode === 'twoPlayer') player2.vx -= 1; break;
                case 'ArrowRight': if (gameMode === 'twoPlayer') player2.vx += 1; break;
            }
        }
        if (e.key === ' ') {
            if (gameState === 'gameOver') {
                restartGame();
            } else if (gameState === 'start') {
                init();
            }
        }
    });

    document.getElementById('start-game').addEventListener('click', () => {
        console.log('Start Game button clicked');
        init();
    });

    document.getElementById('restart-game').addEventListener('click', restartGame);

    document.getElementById('single-player').addEventListener('click', () => {
        console.log('Single Player mode selected');
        gameMode = 'singlePlayer';
        document.getElementById('player2-name').style.display = 'none';
        document.getElementById('player2-label').textContent = 'AI Opponent';
    });

    document.getElementById('two-player').addEventListener('click', () => {
        console.log('Two Player mode selected');
        gameMode = 'twoPlayer';
        document.getElementById('player2-name').style.display = 'inline-block';
        document.getElementById('player2-label').textContent = 'Player 2 Name:';
    });

    console.log('Event listeners set up successfully');
});

drawIceberg();
