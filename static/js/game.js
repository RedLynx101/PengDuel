// ... (keep existing code)

function recordWin(playerName) {
    fetch('/record_win', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player_name: playerName }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Win recorded successfully');
        } else {
            console.error('Failed to record win');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
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

        // Check if a player has fallen off the iceberg
        const distanceFromCenter1 = Math.sqrt((player1.x - canvas.width/2)**2 + (player1.y - canvas.height/2)**2);
        const distanceFromCenter2 = Math.sqrt((player2.x - canvas.width/2)**2 + (player2.y - canvas.height/2)**2);

        if (distanceFromCenter1 > ICEBERG_RADIUS - PENGUIN_RADIUS) {
            gameState = 'gameOver';
            winner = player2;
            recordWin(winner.name);
        } else if (distanceFromCenter2 > ICEBERG_RADIUS - PENGUIN_RADIUS) {
            gameState = 'gameOver';
            winner = player1;
            recordWin(winner.name);
        }
    }
}

// ... (keep the rest of the existing code)
