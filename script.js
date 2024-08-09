document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('gameBoard');
    const log = document.getElementById('log');
    const startButton = document.getElementById('startButton');
    const nextFloorButton = document.getElementById('nextFloorButton');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsMenu = document.getElementById('settingsMenu');
    const themeToggle = document.getElementById('themeToggle');
    const languageToggle = document.getElementById('languageToggle');

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
    let level = 1;
    let boardSize = 10;

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
            shieldUp: 'Shield Up',
            nextFloor: 'Next Floor'
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
            shieldUp: 'Щит',
            nextFloor: 'На Следующий Этаж'
        }
    };

    function initGame() {
        level = 1;
        player = {
            health: 20,
            maxHealth: 20,
            attack: 2,
            shield: 0,
            x: Math.floor(boardSize / 2),
            y: 0
        };
        enemies = [];
        items = [];
        gameBoard.innerHTML = '';
        log.innerHTML = '';
        createBoard();
        updateStats();
        nextFloorButton.classList.add('hidden');
    }

    function createBoard() {
        gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
        gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;
        for (let i = 0; i < boardSize * boardSize; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.textContent = '';
            gameBoard.appendChild(tile);
        }
        placePlayer();
        placeEnemies();
        placeItems();
        placeExit();
    }

    function placePlayer() {
        const playerIndex = player.y * boardSize + player.x;
        gameBoard.children[playerIndex].textContent = languages[currentLanguage].player;
    }

    function placeEnemies() {
        for (let i = 0; i < 5; i++) {
            const x = Math.floor(Math.random() * boardSize);
            const y = Math.floor(Math.random() * boardSize);
            enemies.push({ x, y, health: 5 + level - 1, attack: 1 + level - 1 });
            const enemyIndex = y * boardSize + x;
            gameBoard.children[enemyIndex].textContent = languages[currentLanguage].enemy;
        }
    }

    function placeItems() {
        const itemsArray = [
            { type: 'health', x: Math.floor(Math.random() * boardSize), y: Math.floor(Math.random() * boardSize) },
            { type: 'attack', x: Math.floor(Math.random() * boardSize), y: Math.floor(Math.random() * boardSize) },
            { type: 'shield', x: Math.floor(Math.random() * boardSize), y: Math.floor(Math.random() * boardSize) }
        ];
        items = itemsArray;
        items.forEach(item => {
            const itemIndex = item.y * boardSize + item.x;
            gameBoard.children[itemIndex].textContent = languages[currentLanguage][item.type + 'Up'];
        });
    }

    function placeExit() {
        const x = Math.floor(Math.random() * boardSize);
        const y = Math.floor(Math.random() * boardSize);
        const exitIndex = y * boardSize + x;
        gameBoard.children[exitIndex].textContent = languages[currentLanguage].exit;
    }

    function updateStats() {
        document.getElementById('health').textContent = `❤️ HP: ${player.health}/${player.maxHealth}`;
        document.getElementById('attack').textContent = `⚔️ Attack: ${player.attack}`;
        document.getElementById('shield').textContent = `🛡️ Shield: ${player.shield}`;
    }

    function movePlayer(dx, dy) {
        const newX = player.x + dx;
        const newY = player.y + dy;
        if (isValidMove(newX, newY)) {
            const prevIndex = player.y * boardSize + player.x;
            gameBoard.children[prevIndex].textContent = '';
            player.x = newX;
            player.y = newY;
            const newIndex = player.y * boardSize + player.x;
            gameBoard.children[newIndex].textContent = languages[currentLanguage].player;

            // Check for collisions
            checkCollisions();
        }
    }

    function checkCollisions() {
        enemies.forEach(enemy => {
            const enemyIndex = enemy.y * boardSize + enemy.x;
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
                        const itemIndex = enemy.y * boardSize + enemy.x;
                        gameBoard.children[itemIndex].textContent = languages[currentLanguage][itemType + 'Up'];
                    }
                }
            }
        });

        items.forEach(item => {
            const itemIndex = item.y * boardSize + item.x;
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

        // Check if player is on the exit
        if (gameBoard.children[player.y * boardSize + player.x].textContent === languages[currentLanguage].exit) {
            level += 1;
            boardSize += 2;
            initGame();
            nextFloorButton.classList.add('hidden');
        }
    }

    function isValidMove(x, y) {
        return x >= 0 && x < boardSize && y >= 0 && y < boardSize && !enemies.some(enemy => enemy.x === x && enemy.y === y);
    }

    // Event Listeners
    document.getElementById('up').addEventListener('click', () => movePlayer(0, -1));
    document.getElementById('down').addEventListener('click', () => movePlayer(0, 1));
    document.getElementById('left').addEventListener('click', () => movePlayer(-1, 0));
    document.getElementById('right').addEventListener('click', () => movePlayer(1, 0));

    settingsToggle.addEventListener('click', () => {
        settingsMenu.classList.toggle('hidden');
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
    });

    languageToggle.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'en' ? 'ru' : 'en';
        updateStats();
        log.innerHTML += `<p>Language changed to ${languages[currentLanguage].lang}</p>`;
        initGame();
    });

    startButton.addEventListener('click', initGame);

    nextFloorButton.addEventListener('click', () => {
        level += 1;
        boardSize += 2;
        initGame();
    });

    initGame();
});
