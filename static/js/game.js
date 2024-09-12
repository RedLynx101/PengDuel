// ... (previous code remains unchanged)

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

    // ... (other methods remain unchanged)

    draw() {
        console.log(`Drawing penguin: ${this.name} at (${this.x}, ${this.y})`);
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
}

// ... (other classes and functions remain unchanged)

function draw() {
    console.log('Draw function called');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawIceberg();
    if (player1 && player2) {
        console.log('Drawing players');
        console.log('Player1:', player1);
        console.log('Player2:', player2);
        player1.draw();
        player2.draw();
    } else {
        console.log('Players not initialized');
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

function init() {
    console.log('Game initialization started');
    loadLeaderboard();
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

let lastTime = 0;
const fixedDeltaTime = 1000 / 60; // 60 FPS

function gameLoop(currentTime) {
    if (lastTime === 0) {
        lastTime = currentTime;
    }
    
    const deltaTime = currentTime - lastTime;
    
    if (deltaTime >= fixedDeltaTime) {
        update();
        draw();
        lastTime = currentTime;
    }
    
    requestAnimationFrame(gameLoop);
}

// ... (rest of the code remains unchanged)
