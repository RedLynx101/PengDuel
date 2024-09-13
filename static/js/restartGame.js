import { PowerUp } from './PowerUp.js';

export function restartGame(player1, player2, gameState, powerUps, canvas) {
    console.log('Restarting game');
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

    document.getElementById('player-inputs').style.display = 'block';
    document.getElementById('restart-game').style.display = 'none';

    // Re-enable map selector buttons
    document.querySelectorAll('.map-selector button').forEach(button => {
        button.disabled = false;
    });

    return { gameState, powerUps };
}
