import { PowerUp } from './PowerUp.js';

export function restartGame(player1, player2, gameState, powerUps, canvas) {
    gameState = 'start';

    if (player1) {
        player1.vx = 0;
        player1.vy = 0;
    }

    if (player2.reset) {
        player2.reset(); // This already resets acceleration, maxSpeed, vx, vy for AIPenguin
    } else if (player2) {
        player2.vx = 0;
        player2.vy = 0;
    }

    // Reset power-ups
    powerUps = [new PowerUp(canvas.width, canvas.height)];

    document.getElementById('setup-panel').hidden = false;
    document.getElementById('restart-game').hidden = true;

    return { gameState, powerUps };
}
