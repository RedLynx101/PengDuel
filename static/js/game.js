import { Penguin } from './Penguin.js';
import { AIPenguin } from './AIPenguin.js';
import { PowerUp } from './PowerUp.js';
import { restartGame } from './restartGame.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
export const ICEBERG_RADIUS = 250;
export const PENGUIN_RADIUS = 20;
export const PUSH_FORCE = 8.0;
export const FRICTION = 0.98;
export const POWERUP_RADIUS = 15;
export const POWERUP_DURATION = 10000; // 10 seconds
let penguinSVG;
fetch('/static/assets/penguin.svg')
  .then(response => response.text())
  .then(svgData => {
    penguinSVG = svgData;
    console.log('Penguin SVG loaded successfully');
  })
  .catch(error => {
    console.error('Error loading penguin SVG:', error);
  });
const scores = {};
function updateLeaderboard() {
  const leaderboardDiv = document.getElementById('leaderboard');
  leaderboardDiv.innerHTML = '<h2>Leaderboard</h2>';
  Object.entries(scores).forEach(([name, score]) => {
    leaderboardDiv.innerHTML += `<p>${name}: ${score}</p>`;
  });
}
let gameState = 'start';
let player1, player2;
let winner = null;
let gameMode = 'twoPlayer';
let powerUps = [];
let animationFrameId;
function init() {
    console.log('Game initialization started');
    const player1Name = document.getElementById('player1-name').value || 'Player 1';
    const player2Name = gameMode === 'singlePlayer' ? 'AI Penguin' : (document.getElementById('player2-name').value || 'Player 2');
    console.log(`Initializing players: ${player1Name} and ${player2Name}`);
    const prevPlayer1Crowned = player1 ? player1.crowned : false;
    const prevPlayer2Crowned = player2 ? player2.crowned : false;
    player1 = new Penguin(canvas.width/2 - 50, canvas.height/2, 'blue', player1Name, penguinSVG);
    player1.vx = 0;
    player1.vy = 0;

    if (gameMode === 'singlePlayer') {
        player2 = new AIPenguin(canvas.width/2 + 50, canvas.height/2, 'red', player2Name, penguinSVG);
        player2.reset();
    } else {
        player2 = new Penguin(canvas.width/2 + 50, canvas.height/2, 'red', player2Name, penguinSVG);
        player2.vx = 0;
        player2.vy = 0;
    }
    player1.setCrowned(prevPlayer1Crowned);
    player2.setCrowned(prevPlayer2Crowned);
    if (!scores[player1.name]) scores[player1.name] = 0;
    if (!scores[player2.name]) scores[player2.name] = 0;
    updateLeaderboard();
    gameState = 'playing';
    console.log('Game state set to:', gameState);
    document.getElementById('player-inputs').style.display = 'none';
    document.getElementById('restart-game').style.display = 'none';
    console.log('Game initialized with players:', player1Name, 'and', player2Name);
    console.log('Stopping background music');
    audioManager.stopBackgroundMusic();
    console.log('Attempting to start background music');
    audioManager.playBackgroundMusic('background');
    console.log('Setting collision sound volume');
    audioManager.setVolume('collision', 8);
    powerUps = [new PowerUp(canvas.width, canvas.height)];
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(gameLoop);
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
        const p1DistanceFromCenter = Math.sqrt((player1.x - canvas.width/2)**2 + (player1.y - canvas.height/2)**2);
        const p2DistanceFromCenter = Math.sqrt((player2.x - canvas.width/2)**2 + (player2.y - canvas.height/2)**2);
        if (p1DistanceFromCenter > ICEBERG_RADIUS - player1.currentRadius) {
            gameState = 'gameOver';
            player1.removeCrown();
            player2.removeCrown();
            winner = player2;
            winner.setCrowned(true);
            audioManager.playSound('splash');
            scores[winner.name] = (scores[winner.name] || 0) + 1;
            updateLeaderboard();
        } else if (p2DistanceFromCenter > ICEBERG_RADIUS - player2.currentRadius) {
            gameState = 'gameOver';
            player1.removeCrown();
            player2.removeCrown();
            winner = player1;
            winner.setCrowned(true);
            audioManager.playSound('splash');
            scores[winner.name] = (scores[winner.name] || 0) + 1;
            updateLeaderboard();
        }
        player1.update(canvas, gameState, winner, audioManager, scores, updateLeaderboard);
        player2.update(canvas, gameState, winner, audioManager, scores, updateLeaderboard, player1);
        const dx = player2.x - player1.x;
        const dy = player2.y - player1.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < player1.currentRadius + player2.currentRadius) {
            const angle = Math.atan2(dy, dx);
            const tx = player1.x + Math.cos(angle) * (player1.currentRadius + player2.currentRadius);
            const ty = player1.y + Math.sin(angle) * (player1.currentRadius + player2.currentRadius);
            player2.x = tx;
            player2.y = ty;
            const push = PUSH_FORCE / distance;
            const player1Mass = player1.mass;
            const player2Mass = player2.mass;
            player2.vx += dx * push / player2Mass;
            player2.vy += dy * push / player2Mass;
            player1.vx -= dx * push / player1Mass;
            player1.vy -= dy * push / player1Mass;
            audioManager.playSound('collision');
            audioManager.playSound('beep');
        }
        powerUps.forEach((powerUp, index) => {
            [player1, player2].forEach(player => {
                const dx = player.x - powerUp.x;
                const dy = player.y - powerUp.y;
                const distance = Math.sqrt(dx*dx + dy*dy);

                if (distance < player.currentRadius + POWERUP_RADIUS) {
                    player.activatePowerUp(powerUp.type);
                    powerUps.splice(index, 1);
                    setTimeout(() => powerUps.push(new PowerUp(canvas.width, canvas.height)), 5000);
                    audioManager.playSound('powerup'); // Play the new power-up sound
                }
            });
        });
    }
}

function draw() {
    console.log('Drawing game frame, gameState:', gameState);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawIceberg();
    if (player1) {
        console.log('Attempting to draw player1');
        player1.draw(ctx);
    }
    if (player2) {
        console.log('Attempting to draw player2');
        player2.draw(ctx);
    }    
    console.log('Drawing power-ups');
    powerUps.forEach(powerUp => powerUp.draw(ctx));
    

    if (gameState === 'gameOver' && winner) {
        console.log('Drawing game over screen');
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${winner.name} wins!`, canvas.width/2, 50);
        document.getElementById('restart-game').style.display = 'block';
    }
}


function gameLoop() {
    console.log('Game loop iteration');
    update();
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
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
                const result = restartGame(player1, player2, gameState, powerUps, canvas);
                gameState = result.gameState;
                powerUps = result.powerUps;
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
                animationFrameId = requestAnimationFrame(gameLoop);
            } else if (gameState === 'start') {
                init();
            }
        }
    });
    document.getElementById('start-game').addEventListener('click', () => {
        console.log('Start Game button clicked');
        init();
    });
    document.getElementById('restart-game').addEventListener('click', () => {
        const result = restartGame(player1, player2, gameState, powerUps, canvas);
        gameState = result.gameState;
        powerUps = result.powerUps;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = requestAnimationFrame(gameLoop);
    });
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