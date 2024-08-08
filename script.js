const WIDTH = 10;
const HEIGHT = 10;
const INITIAL_ENEMY_HEALTH = 5;
const INITIAL_ENEMY_DAMAGE = 1;
const INITIAL_PLAYER_HEALTH = 100;
const INITIAL_PLAYER_DAMAGE = 10;
let playerPosition = { x: 1, y: 1 };
let playerHealth = INITIAL_PLAYER_HEALTH;
let playerDamage = INITIAL_PLAYER_DAMAGE;
let currentLevel = 1;
let board = [];
let enemies = [];

// Генерация игрового поля
function generateBoard() {
    board = [];
    enemies = [];
    for (let y = 0; y < HEIGHT; y++) {
        let row = [];
        for (let x = 0; x < WIDTH; x++) {
            if (x === 0 || x === WIDTH - 1 || y === 0 || y === HEIGHT - 1) {
                row.push('|'); // стены
            } else if (x === playerPosition.x && y === playerPosition.y) {
                row.push('@'); // игрок
            } else if (Math.random() < 0.05 * currentLevel) {
                row.push('§'); // враг
                enemies.push({ x, y, health: INITIAL_ENEMY_HEALTH + currentLevel - 1, damage: INITIAL_ENEMY_DAMAGE + currentLevel - 1 });
            } else if (Math.random() < 0.1) {
                row.push('+'); // предмет, восстанавливающий здоровье
            } else if (Math.random() < 0.1) {
                row.push('!'); // временное усиление
            } else if (Math.random() < 0.05) {
                row.push('$'); // постоянное усиление
            } else if (x === Math.floor(WIDTH / 2) && y === HEIGHT - 2) {
                row.push('>'); // переход на следующий уровень
            } else {
                row.push('.'); // пустое место
            }
        }
        board.push(row);
    }
}

// Обновление позиции всех врагов
function updateEnemies() {
    for (let enemy of enemies) {
        const direction = Math.random();
        if (direction < 0.25 && isValidMove({ x: enemy.x, y: enemy.y - 1 })) {
            enemy.y -= 1; // move up
        } else if (direction < 0.5 && isValidMove({ x: enemy.x, y: enemy.y + 1 })) {
            enemy.y += 1; // move down
        } else if (direction < 0.75 && isValidMove({ x: enemy.x - 1, y: enemy.y })) {
            enemy.x -= 1; // move left
        } else if (isValidMove({ x: enemy.x + 1, y: enemy.y })) {
            enemy.x += 1; // move right
        }
    }
}

// Отображение игрового поля
function renderBoard() {
    const tempBoard = board.map(row => row.slice());
    for (let enemy of enemies) {
        if (enemy.health > 0) {
            tempBoard[enemy.y][enemy.x] = '§';
        }
    }
    tempBoard[playerPosition.y][playerPosition.x] = '@';
    let display = tempBoard.map(row => row.join('')).join('\n');
    document.getElementById('gameBoard').textContent = display;
}

// Перемещение игрока
function movePlayer(direction) {
    const newPosition = { ...playerPosition };

    if (direction === 'up') newPosition.y -= 1;
    if (direction === 'down') newPosition.y += 1;
    if (direction === 'left') newPosition.x -= 1;
    if (direction === 'right') newPosition.x += 1;

    if (isValidMove(newPosition)) {
        playerPosition = newPosition;
        handleInteraction();
        updateEnemies();
        updateBoard();
        renderBoard();
        updateUI();
    }
}

// Проверка допустимости перемещения
function isValidMove(position) {
    return position.x > 0 && position.x < WIDTH - 1 &&
           position.y > 0 && position.y < HEIGHT - 1;
}

// Обработка взаимодействия с объектами
function handleInteraction() {
    let currentTile = board[playerPosition.y][playerPosition.x];

    if (currentTile === '§') {
        attackEnemy(playerPosition.x, playerPosition.y);
    } else if (currentTile === '+') {
        playerHealth = Math.min(playerHealth + 20, INITIAL_PLAYER_HEALTH);
        log('Вы нашли аптечку. Здоровье восстановлено: ' + playerHealth);
    } else if (currentTile === '!') {
        activateTemporaryBoost();
    } else if (currentTile === '$') {
        applyPermanentBoost();
    } else if (currentTile === '>') {
        nextLevel();
    }
}

// Активация временного усиления
function activateTemporaryBoost() {
    let rand = Math.random();
    if (rand < 0.5) {
        log('Вы получили временное ускорение!');
        setTimeout(() => {
            log('Эффект ускорения закончился.');
        }, 10000); // Время действия 10 секунд
    } else {
        log('Вы получили временную защиту!');
        setTimeout(() => {
            log('Эффект защиты закончился.');
        }, 10000); // Время действия 10 секунд
    }
}

// Применение постоянного усиления
function applyPermanentBoost() {
    let rand = Math.random();
    if (rand < 0.5) {
        playerHealth = Math.min(playerHealth + 20, INITIAL_PLAYER_HEALTH);
        log('Максимальное здоровье увеличено до ' + playerHealth + '!');
    } else {
        playerDamage += 5;
        log('Урон увеличен до ' + playerDamage + '!');
    }
}

// Переход на следующий уровень
function nextLevel() {
    currentLevel += 1;
    playerHealth = INITIAL_PLAYER_HEALTH;
    playerDamage = INITIAL_PLAYER_DAMAGE;
    generateBoard();
    renderBoard();
    updateUI();
    log('Вы перешли на уровень ' + currentLevel + '!');
}

// Атака врага
function attackEnemy(x, y) {
    let enemy = enemies.find(e => e.x === x && e.y === y);
    if (enemy) {
        enemy.health -= playerDamage;
        if (enemy.health <= 0) {
            log('Враг повержен!');
            enemies = enemies.filter(e => e !== enemy);
            board[y][x] = '.';
        } else {
            log('Вы нанесли ' + playerDamage + ' урона врагу. Здоровье врага: ' + enemy.health);
        }
    }
}

// Обновление игрового поля
function updateBoard() {
    board[playerPosition.y][playerPosition.x] = '.';
    board = board.map(row => row.map(cell => cell === '@' ? '.' : cell));
}

// Обновление интерфейса
function updateUI() {
    document.getElementById('health').textContent = playerHealth;
    document.getElementById('damage').textContent = playerDamage;
    document.getElementById('level').textContent = currentLevel;
    document.getElementById('enemy-damage').textContent = INITIAL_ENEMY_DAMAGE + currentLevel - 1;
}

// Логирование сообщений
function log(message) {
    const logElement = document.getElementById('log');
    logElement.textContent += message + '\n';
}

// Инициализация игры
function initGame() {
    generateBoard();
    renderBoard();
    updateUI();
}

initGame();
