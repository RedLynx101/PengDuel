import { Penguin } from './Penguin.js';
import { AIPenguin } from './AIPenguin.js';
import { PowerUp } from './PowerUp.js';
import { restartGame } from './restartGame.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

export const ICEBERG_RADIUS = 250;
export const PENGUIN_RADIUS = 20;
export const PUSH_FORCE = 2.5;
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
    audioManager.setVolume('collision', 5);

    powerUps = [new PowerUp(canvas.width, canvas.height)];

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

// ... (rest of the file remains unchanged)
