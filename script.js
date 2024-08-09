document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('gameBoard');
    const log = document.getElementById('log');
    const startButton = document.getElementById('startButton');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsMenu = document.getElementById('settingsMenu');
    const themeToggle = document.getElementById('themeToggle');
    const languageToggle = document.getElementById('languageToggle');

    // Initialize game state
    let player = {
        health: 20,
        maxHealth: 20,
        attack: 2,
        shield: 0,
        x: 4,
        y: 4
    };

    let enemies = [];
    let items = [];

    let currentLanguage = 'en';

    const languages = {
        en: {
            start: 'Start Game',
            shield: 'Shield',
            health: 'HP',
            attack: 'Attack',
            theme: 'Toggle Theme',
            lang: 'Switch Language',
            enemy: 'E',
            wall: '|',
            exit: 'O',
            player: '@',
            potion: '+',
            healthUp: 'Health Up',
            attackUp: 'Attack Up',
            shieldUp: 'Shield Up'
        },
        ru: {
            start: 'Начать Игру',
            shield: 'Щит',
            health: 'Здоровье',
            attack: 'Атака',
            theme: 'Переключить Тему',
            lang: 'Сменить Язык',
            enemy: 'В',
            wall: '|',
            exit: 'В',
            player: '@',
            potion: '+',
            healthUp: 'Увеличение Здоровья',
            attackUp: 'Увеличение Атаки',
            shieldUp: 'Щит'
        }
    };

    // Initialize game
    function initGame() {
        gameBoard.innerHTML = '';
        log.innerHTML = '';
        enemies = [];
        items = [];
        createBoard();
        updateStats();
    }

    // Create game board
    function createBoard() {
        const boardSize = 100;
        gameBoard.innerHTML = '';
        for (let i = 0; i < boardSize; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.textContent = '';
            gameBoard.appendChild(tile);
        }
        placePlayer();
        placeEnemies();
        placeItems();
    }

    // Place player on board
    function placePlayer() {
        const playerIndex = player.y * 10 + player.x;
        gameBoard.children[playerIndex].textContent = languages[currentLanguage].player;
    }

    // Place enemies
    function placeEnemies() {
        for (let i = 0; i < 5; i++) {
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);
            enemies.push({ x, y, health: 5, attack: 1 });
            const enemyIndex = y * 10 + x;
            gameBoard.children[enemyIndex].textContent = languages[currentLanguage].enemy;
        }
    }

    // Place items
    function placeItems() {
        const itemsArray = [
            { type: 'health', x: Math.floor(Math.random() * 10), y: Math.floor(Math.random() * 10) },
            { type: 'attack', x: Math.floor(Math.random() * 10), y: Math.floor(Math.random() * 10) },
            { type: 'shield', x: Math.floor(Math.random() * 10), y: Math.floor(Math.random() * 10) }
        ];
        items = itemsArray;
        items.forEach(item => {
            const itemIndex = item.y * 10 + item.x;
            gameBoard.children[itemIndex].textContent = languages[currentLanguage][item.type + 'Up'];
        });
    }

    // Update stats display
    function updateStats() {
        document.getElementById('health').textContent = `${languages[currentLanguage].health}: ${player.health}/${player.maxHealth}`;
        document.getElementById('attack').textContent = `${languages[currentLanguage].attack}: ${player.attack}`;
        document.getElementById('shield').textContent = `${languages[currentLanguage].shield}: ${player.shield}`;
    }

    // Toggle theme
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
    });

    // Toggle language
    languageToggle.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'en' ? 'ru' : 'en';
        updateStats();
        createBoard();
    });

    // Show/hide settings menu
    settingsToggle.addEventListener('click', () => {
        settingsMenu.classList.toggle('hidden');
    });

    // Start game
    startButton.addEventListener('click', initGame);

    // Control movement
    document.getElementById('up').addEventListener('click', () => movePlayer(0, -1));
    document.getElementById('down').addEventListener('click', () => movePlayer(0, 1));
    document.getElementById('left').addEventListener('click', () => movePlayer(-1, 0));
    document.getElementById('right').addEventListener('click', () => movePlayer(1, 0));

    // Move player
    function movePlayer(dx, dy) {
        const newX = player.x + dx;
        const newY = player.y + dy;
        if (isValidMove(newX, newY)) {
            const prevIndex = player.y * 10 + player.x;
            gameBoard.children[prevIndex].textContent = '';
            player.x = newX;
            player.y = newY;
            const newIndex = player.y * 10 + player.x;
            gameBoard.children[newIndex].textContent = languages[currentLanguage].player;

            // Check for collisions
            checkCollisions();
        }
    }

    // Check for collisions with enemies and items
    function checkCollisions() {
        enemies.forEach(enemy => {
            const enemyIndex = enemy.y * 10 + enemy.x;
            if (player.x === enemy.x && player.y === enemy.y) {
                // Player attacks enemy
                enemy.health -= player.attack;
                log.innerHTML += `<p>${languages[currentLanguage].enemy} attacked!</p>`;
                if (enemy.health <= 0) {
                    // Enemy defeated
                    log.innerHTML += `<p>${languages[currentLanguage].enemy} defeated!</p>`;
                    gameBoard.children[enemyIndex].textContent = '';
                    // Drop items
                    if (Math.random() < 0.5) {
                        const itemType = Math.random() < 0.5 ? 'attack' : 'health';
                        items.push({ type: itemType, x: enemy.x, y: enemy.y });
                        const itemIndex = enemy.y * 10 + enemy.x;
                        gameBoard.children[itemIndex].textContent = languages[currentLanguage][itemType + 'Up'];
                    }
                }
            }
        });

        items.forEach(item => {
            const itemIndex = item.y * 10 + item.x;
            if (player.x === item.x && player.y === item.y) {
                // Player picks up item
                log.innerHTML += `<p>Picked up ${languages[currentLanguage][item.type + 'Up']}!</p>`;
                if (item.type === 'health') {
                    player.health = Math.min(player.maxHealth, player.health + 5);
                } else if (item.type === 'attack') {
                    player.attack += 1;
                } else if (item.type === 'shield') {
                    player.shield += 1;
                }
                updateStats();
                gameBoard.children[itemIndex].textContent = '';
            }
        });
    }

    // Check if move is valid
    function isValidMove(x, y) {
        return x >= 0 && x < 10 && y >= 0 && y < 10;
    }

    // Initialize the game
    initGame();
});
