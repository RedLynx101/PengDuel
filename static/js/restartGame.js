import { PowerUp } from './PowerUp.js';

export function restartGame(player1, player2, gameState, powerUps, canvas, icebergShapes) {
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

    // Select a new random iceberg shape
    const newIcebergShape = icebergShapes[Math.floor(Math.random() * icebergShapes.length)];
    console.log('Selected new iceberg shape:', newIcebergShape.type);

    // Reset power-ups with the new iceberg shape
    powerUps = [new PowerUp(canvas.width, canvas.height, newIcebergShape)];

    document.getElementById('player-inputs').style.display = 'block';
    document.getElementById('restart-game').style.display = 'none';

    return { gameState, powerUps, currentIcebergShape: newIcebergShape };
}
