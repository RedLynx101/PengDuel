const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ICEBERG_RADIUS = 250;
const PENGUIN_RADIUS = 20;
const PUSH_FORCE = 2.5; // Reduced by half
const FRICTION = 0.98;

let gameState = 'start';
let player1, player2;
let winner = null;

class Penguin {
    constructor(x, y, color, name) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.name = name;
        this.vx = 0;
        this.vy = 0;
        this.crowned = false;
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
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, PENGUIN_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = 'black'; // Changed to black for better visibility
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y + PENGUIN_RADIUS + 20);

        if (this.crowned) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - PENGUIN_RADIUS - 10);
            ctx.lineTo(this.x - 15, this.y - PENGUIN_RADIUS + 5);
            ctx.lineTo(this.x + 15, this.y - PENGUIN_RADIUS + 5);
            ctx.closePath();
            ctx.fillStyle = 'gold';
            ctx.fill();
        }
    }
}

function init() {
    console.log('Game initialization started');
    const player1Name = document.getElementById('player1-name').value || 'Player 1';
    const player2Name = document.getElementById('player2-name').value || 'Player 2';

    // Store the previous crown status if it exists
    const prevPlayer1Crowned = player1 ? player1.crowned : false;
    const prevPlayer2Crowned = player2 ? player2.crowned : false;

    player1 = new Penguin(canvas.width/2 - 50, canvas.height/2, 'blue', player1Name);
    player2 = new Penguin(canvas.width/2 + 50, canvas.height/2, 'red', player2Name);

    // Restore the crown status
    player1.crowned = prevPlayer1Crowned;
    player2.crowned = prevPlayer2Crowned;

    gameState = 'playing';
    document.getElementById('player-inputs').style.display = 'none';
    document.getElementById('restart-game').style.display = 'none';
    console.log('Game initialized with players:', player1Name, 'and', player2Name);
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
            player2.vx += dx * push;
            player2.vy += dy * push;
            player1.vx -= dx * push;
            player1.vy -= dy * push;

            audioManager.playSound('collision');
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawIceberg();
    if (player1 && player2) {
        player1.draw();
        player2.draw();
    }

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
    gameState = 'start';
    document.getElementById('player-inputs').style.display = 'block';
    document.getElementById('restart-game').style.display = 'none';
    // Crown status is not reset here
}

document.addEventListener('keydown', (e) => {
    if (gameState === 'playing') {
        switch(e.key) {
            case 'w': player1.vy -= 1; break;
            case 's': player1.vy += 1; break;
            case 'a': player1.vx -= 1; break;
            case 'd': player1.vx += 1; break;
            case 'ArrowUp': player2.vy -= 1; break;
            case 'ArrowDown': player2.vy += 1; break;
            case 'ArrowLeft': player2.vx -= 1; break;
            case 'ArrowRight': player2.vx += 1; break;
        }
    }
    if (e.key === ' ') { // Spacebar
        if (gameState === 'gameOver') {
            restartGame();
        } else if (gameState === 'start') {
            init();
            gameLoop();
        }
    }
});

document.getElementById('start-game').addEventListener('click', () => {
    console.log('Start Game button clicked');
    init();
    gameLoop();
});

document.getElementById('restart-game').addEventListener('click', restartGame);

// Initial draw to show the iceberg
drawIceberg();
