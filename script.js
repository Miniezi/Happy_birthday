// script.js
document.addEventListener('DOMContentLoaded', () => {
    const boardSize = 10;
    const board = document.getElementById('gameBoard');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsMenu = document.getElementById('settingsMenu');
    const themeToggle = document.getElementById('themeToggle');
    const languageToggle = document.getElementById('languageToggle');
    const startButton = document.getElementById('startButton');
    const nextFloorButton = document.getElementById('nextFloorButton');
    const log = document.getElementById('log');
    const floorDisplay = document.getElementById('floor');

    let player = {
        x: 0,
        y: 0,
        health: 20,
        maxHealth: 20,
        attack: 2,
        defense: 0,
        level: 1,
        experience: 0
    };

    let enemies = [];
    let items = [];
    let currentLanguage = 'en';
    let currentFloor = 0;
    let keyPosition = null;

    const languages = {
        en: {
            start: 'Game started!',
            levelUp: 'Level up!',
            pickedUp: 'Picked up',
            enemyDefeated: 'Enemy defeated!',
            exit: 'Exit',
            key: 'Key',
            doubleDamage: 'Double Damage',
            shield: 'Shield',
            invisibility: 'Invisibility',
            attack: '⚔️ Attack',
            health: '❤️ HP',
            defense: '🛡️ Defense',
            level: '🏆 Level',
            floor: '🏢 Floor: ',
            nextFloor: 'Next Floor',
            settings: 'Settings',
            switchLanguage: 'Switch Language',
            toggleTheme: 'Toggle Theme'
        },
        ru: {
            start: 'Игра началась!',
            levelUp: 'Повышение уровня!',
            pickedUp: 'Подобрано',
            enemyDefeated: 'Враг повержен!',
            exit: 'Выход',
            key: 'Ключ',
            doubleDamage: 'Двойной Урон',
            shield: 'Щит',
            invisibility: 'Невидимость',
            attack: '⚔️ Атака',
            health: '❤️ Здоровье',
            defense: '🛡️ Защита',
            level: '🏆 Уровень',
            floor: '🏢 Этаж: ',
            nextFloor: 'Следующий Этаж',
            settings: 'Настройки',
            switchLanguage: 'Сменить Язык',
            toggleTheme: 'Сменить Тему'
        }
    };

    function initGame() {
        board.innerHTML = '';
        enemies = [];
        items = [];
        currentFloor = 0;
        player.x = Math.floor(boardSize / 2);
        player.y = 0;
        generateLevel();
        updateStats();
        floorDisplay.textContent = `${languages[currentLanguage].floor}${currentFloor}`;
        nextFloorButton.classList.add('hidden');
        log.textContent = languages[currentLanguage].start;
    }

    function generateLevel() {
        // Generate board
        for (let i = 0; i < boardSize * boardSize; i++) {
            const cell = document.createElement('div');
            board.appendChild(cell);
        }

        // Place player
        const startIndex = player.y * boardSize + player.x;
        board.children[startIndex].textContent = '@';

        // Place key and exit
        placeKeyAndExit();
        
        // Place enemies and items
        placeEnemies();
        placeItems();
    }

    function placeKeyAndExit() {
        let exitPlaced = false;
        while (!exitPlaced) {
            const randomIndex = Math.floor(Math.random() * (boardSize * boardSize));
            const cell = board.children[randomIndex];
            if (!cell.textContent) {
                cell.textContent = languages[currentLanguage].exit;
                exitPlaced = true;
            }
        }

        let keyPlaced = false;
        while (!keyPlaced) {
            const randomIndex = Math.floor(Math.random() * (boardSize * boardSize));
            const cell = board.children[randomIndex];
            if (!cell.textContent) {
                keyPosition = {
                    x: randomIndex % boardSize,
                    y: Math.floor(randomIndex / boardSize)
                };
                cell.textContent = languages[currentLanguage].key;
                keyPlaced = true;
            }
        }
    }

    function placeEnemies() {
        for (let i = 0; i < 5; i++) {
            let enemyPlaced = false;
            while (!enemyPlaced) {
                const randomIndex = Math.floor(Math.random() * (boardSize * boardSize));
                const cell = board.children[randomIndex];
                if (!cell.textContent) {
                    cell.textContent = 'E';
                    enemies.push({
                        x: randomIndex % boardSize,
                        y: Math.floor(randomIndex / boardSize),
                        health: 5 + currentFloor * 2,
                        attack: 1 + currentFloor * 0.5,
                        defense: 0 + currentFloor * 0.2
                    });
                    enemyPlaced = true;
                }
            }
        }
    }

    function placeItems() {
        if (Math.random() < 0.5) {
            let itemPlaced = false;
            while (!itemPlaced) {
                const randomIndex = Math.floor(Math.random() * (boardSize * boardSize));
                const cell = board.children[randomIndex];
                if (!cell.textContent) {
                    const itemType = ['doubleDamage', 'shield', 'invisibility'][Math.floor(Math.random() * 3)];
                    cell.textContent = languages[currentLanguage][itemType];
                    items.push({
                        x: randomIndex % boardSize,
                        y: Math.floor(randomIndex / boardSize),
                        type: itemType
                    });
                    itemPlaced = true;
                }
            }
        }
    }

    function movePlayer(dx, dy) {
        const newX = player.x + dx;
        const newY = player.y + dy;
        const newIndex = newY * boardSize + newX;
        if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize) {
            const cell = board.children[newIndex];
            if (cell.textContent !== 'E') {
                player.x = newX;
                player.y = newY;
                updateBoard();
                checkCollisions();
            }
        }
    }

    function updateBoard() {
        board.innerHTML = '';
        generateLevel();
        const startIndex = player.y * boardSize + player.x;
        board.children[startIndex].textContent = '@';
    }

    function checkCollisions() {
        const index = player.y * boardSize + player.x;
        const cell = board.children[index];
        if (cell.textContent === languages[currentLanguage].exit) {
            nextFloor();
        } else if (cell.textContent === languages[currentLanguage].key) {
            // Logic for picking up key
        } else {
            for (const item of items) {
                if (item.x === player.x && item.y === player.y) {
                    // Logic for picking up items
                    applyItemEffect(item);
                }
            }
            for (const enemy of enemies) {
                if (enemy.x === player.x && enemy.y === player.y) {
                    // Logic for fighting enemies
                    fightEnemy(enemy);
                }
            }
        }
    }

    function fightEnemy(enemy) {
        player.health -= Math.max(1, enemy.attack - player.defense);
        enemy.health -= player.attack;
        log.textContent = languages[currentLanguage].enemyDefeated;
        if (enemy.health <= 0) {
            enemies = enemies.filter(e => e !== enemy);
            // Check if item is dropped
        }
        if (player.health <= 0) {
            log.textContent = 'Game Over';
            // Logic for game over
        }
        updateStats();
    }

    function applyItemEffect(item) {
        switch (item.type) {
            case 'doubleDamage':
                player.attack *= 2;
                break;
            case 'shield':
                player.defense *= 2;
                break;
            case 'invisibility':
                // Temporary invulnerability logic
                break;
        }
    }

    function nextFloor() {
        currentFloor++;
        initGame();
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
    }

    function toggleLanguage() {
        currentLanguage = currentLanguage === 'en' ? 'ru' : 'en';
        updateStats();
    }

    function updateStats() {
        document.getElementById('health').textContent = `${languages[currentLanguage].health} ${player.health}/${player.maxHealth}`;
        document.getElementById('attack').textContent = `${languages[currentLanguage].attack}: ${player.attack}`;
        document.getElementById('defense').textContent = `${languages[currentLanguage].defense}: ${player.defense}`;
        document.getElementById('level').textContent = `${languages[currentLanguage].level}: ${player.level}`;
        floorDisplay.textContent = `${languages[currentLanguage].floor}${currentFloor}`;
    }

    settingsToggle.addEventListener('click', () => {
        settingsMenu.classList.toggle('hidden');
    });

    themeToggle.addEventListener('click', toggleTheme);
    languageToggle.addEventListener('click', toggleLanguage);

    document.getElementById('up').addEventListener('click', () => movePlayer(0, -1));
    document.getElementById('down').addEventListener('click', () => movePlayer(0, 1));
    document.getElementById('left').addEventListener('click', () => movePlayer(-1, 0));
    document.getElementById('right').addEventListener('click', () => movePlayer(1, 0));

    startButton.addEventListener('click', initGame);
    nextFloorButton.addEventListener('click', nextFloor);
});
