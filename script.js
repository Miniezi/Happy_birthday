const WIDTH = 10;
const HEIGHT = 10;
const INITIAL_ENEMY_HEALTH = 5;
const INITIAL_ENEMY_DAMAGE = 1;
const INITIAL_PLAYER_HEALTH = 100;
const INITIAL_PLAYER_DAMAGE = 10;
const SHIELD_DURATION = 10000; // 10 seconds
const MAX_HEALTH = INITIAL_PLAYER_HEALTH;

let playerPosition = { x: 1, y: 1 };
let playerHealth = INITIAL_PLAYER_HEALTH;
let playerDamage = INITIAL_PLAYER_DAMAGE;
let currentLevel = 1;
let hasShield = false;
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
                enemies.push({
                    x, 
                    y, 
                    health: INITIAL_ENEMY_HEALTH + currentLevel - 1, 
                    damage: INITIAL_ENEMY_DAMAGE + currentLevel - 1
                });
            } else if (Math.random() < 0.1) {
                row.push('+'); // предмет, восстанавливающий здоровье
            } else if (Math.random() < 0.1) {
                row.push('!'); // временное усиление
            } else if (Math.random() < 0.05) {
                row.push('$'); // постоянное усиление
            } else if (x === Math.floor(WIDTH / 2) && y === HEIGHT - 2) {
                row.push('>'); // выход на следующий уровень
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
        const newPosition = { x: enemy.x, y: enemy.y };

        if (direction < 0.25) newPosition.y -= 1; // move up
        else if (direction < 0.5) newPosition.y += 1; // move down
        else if (direction < 0.75) newPosition.x -= 1; // move left
        else newPosition.x += 1; // move right

        if (isValidMove(newPosition)) {
            board[enemy.y][enemy.x] = '.';
            enemy.x = newPosition.x;
            enemy.y = newPosition.y;
            board[enemy.y][enemy.x] = '§';
        }
    }
}

// Проверка допустимости перемещения
function isValidMove(position) {
    if (position.x <= 0 || position.x >= WIDTH - 1 ||
        position.y <= 0 || position.y >= HEIGHT - 1) {
        return false;
    }

    // Проверяем, не занята ли позиция игроком или другим врагом
    if (board[position.y][position.x] === '@' || board[position.y][position.x] === '§') {
        return false;
    }

    return true;
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
        enemyAttack();
    }
}

// Обработка взаимодействия с объектами
function handleInteraction() {
    let currentTile = board[playerPosition.y][playerPosition.x];

    if (currentTile === '§') {
        attackEnemy(playerPosition.x, playerPosition.y);
    } else if (currentTile === '+') {
        playerHealth = Math.min(playerHealth + 20, MAX_HEALTH);
        log('Вы нашли аптечку. Здоровье восстановлено: ' + playerHealth);
        board[playerPosition.y][playerPosition.x] = '.';
    } else if (currentTile === '!') {
        activateTemporaryBoost();
        board[playerPosition.y][playerPosition.x] = '.';
    } else if (currentTile === '$') {
        applyPermanentBoost();
        board[playerPosition.y][playerPosition.x] = '.';
    } else if (currentTile === '>') {
        nextLevel();
    }
}

// Активация временного усиления
function activateTemporaryBoost() {
    let rand = Math.random();
    if (rand < 0.5) {
        playerDamage += 5;
        log('💪 Вы нашли временное усиление! Урон увеличен до ' + playerDamage);
    } else if (!hasShield) {
        hasShield = true;
        log('🛡️ Вы нашли щит! Блокирует входящий урон.');
        setTimeout(() => {
            hasShield = false;
            log('Щит истек!');
        }, SHIELD_DURATION);
    } else {
        log('Щит уже активен!');
    }
}

// Применение постоянного усиления
function applyPermanentBoost() {
    playerDamage += 5;
    log('⚔️ Постоянное усиление! Урон увеличен до ' + playerDamage);
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
            log('💥 Враг повержен!');
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
    document.getElementById('max-health').textContent = MAX_HEALTH;
    document.getElementById('damage').textContent = playerDamage;
    document.getElementById('level').textContent = currentLevel;
    document.getElementById('enemy-damage').textContent = INITIAL_ENEMY_DAMAGE + currentLevel - 1;
}

// Логирование сообщений
function log(message) {
    const logElement = document.getElementById('log');
    logElement.textContent = message;
}

// Обработка атаки врага
function enemyAttack() {
    for (let enemy of enemies) {
        if (enemy.x === playerPosition.x && enemy.y === playerPosition.y) {
            if (hasShield) {
                log('🛡️ Щит блокирует входящий урон!');
            } else {
                playerHealth -= enemy.damage;
                if (playerHealth <= 0) {
                    log('💀 Вы погибли!');
                    alert('Game Over');
                    // Перезагрузить игру
                    window.location.reload();
                } else {
                    log('Враг атакует! Ваше здоровье: ' + playerHealth);
                }
            }
        }
    }
}

// Обработка урона при перемещении рядом с врагами
function checkProximityDamage() {
    for (let enemy of enemies) {
        if (Math.abs(playerPosition.x - enemy.x) <= 1 && Math.abs(playerPosition.y - enemy.y) <= 1) {
            if (!hasShield) {
                playerHealth -= enemy.damage;
                if (playerHealth <= 0) {
                    log('💀 Вы погибли!');
                    alert('Game Over');
                    window.location.reload();
                } else {
                    log('Враг рядом! Ваше здоровье: ' + playerHealth);
                }
            }
        }
    }
}

// Инициализация игры
function initializeGame() {
    generateBoard();
    renderBoard();
    updateUI();

    document.getElementById('moveUp').addEventListener('click', () => movePlayer('up'));
    document.getElementById('moveDown').addEventListener('click', () => movePlayer('down'));
    document.getElementById('moveLeft').addEventListener('click', () => movePlayer('left'));
    document.getElementById('moveRight').addEventListener('click', () => movePlayer('right'));

    setInterval(checkProximityDamage, 1000); // Проверка урона от врагов раз в секунду
}

initializeGame();
