document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('gameBoard');
    const log = document.getElementById('log');
    const startButton = document.getElementById('startButton');
    const themeToggle = document.getElementById('themeToggle');
    const languageToggle = document.getElementById('languageToggle');
    
    // Character stats
    let player = {
        health: 20,
        maxHealth: 20,
        attack: 2,
        shield: 0,
        x: 4,
        y: 4
    };

    // Initialize game
    function initGame() {
        gameBoard.innerHTML = '';
        log.innerHTML = '';
        createBoard();
        updateStats();
    }

    // Create game board
    function createBoard() {
        const boardSize = 100;
        for (let i = 0; i < boardSize; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.textContent = i % 10 === 0 ? '@' : ' ';
            gameBoard.appendChild(tile);
        }
    }

    // Update stats
    function updateStats() {
        document.getElementById('health').textContent = `❤️ HP: ${player.health}/${player.maxHealth}`;
        document.getElementById('attack').textContent = `⚔️ Attack: ${player.attack}`;
        document.getElementById('shield').textContent = `🛡️ Shield: ${player.shield}`;
    }

    // Toggle theme
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
    });

    // Start game
    startButton.addEventListener('click', initGame);

    // Log action
    function logAction(action) {
        log.textContent = action;
    }

    // Movement handling
    document.querySelectorAll('.controls button').forEach(button => {
        button.addEventListener('click', () => {
            const direction = button.id;
            let moved = false;

            switch (direction) {
                case 'up':
                    if (player.y > 0) {
                        player.y -= 1;
                        moved = true;
                    }
                    break;
                case 'down':
                    if (player.y < 9) {
                        player.y += 1;
                        moved = true;
                    }
                    break;
                case 'left':
                    if (player.x > 0) {
                        player.x -= 1;
                        moved = true;
                    }
                    break;
                case 'right':
                    if (player.x < 9) {
                        player.x += 1;
                        moved = true;
                    }
                    break;
            }

            if (moved) {
                logAction(`Player moved ${direction}`);
                // Update player's position on board
                updateBoard();
            }
        });
    });

    // Update board
    function updateBoard() {
        [...gameBoard.children].forEach(tile => {
            tile.textContent = ' ';
        });

        const playerIndex = player.y * 10 + player.x;
        gameBoard.children[playerIndex].textContent = '@';
    }

    // Initialize game on page load
    initGame();
});
