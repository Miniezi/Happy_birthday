const WIDTH = 10;
const HEIGHT = 10;
const INITIAL_ENEMY_HEALTH = 5;
const INITIAL_ENEMY_DAMAGE = 1;
const INITIAL_PLAYER_HEALTH = 20;
const INITIAL_PLAYER_DAMAGE = 2;
const SHIELD_DURATION = 10000; // 10 seconds
const MAX_HEALTH = INITIAL_PLAYER_HEALTH;

let playerPosition = { x: Math.floor(WIDTH / 2), y: 0 };
let playerHealth = INITIAL_PLAYER_HEALTH;
let playerDamage = INITIAL_PLAYER_DAMAGE;
let currentLevel = 1;
let hasShield = false;
let board = [];
let enemies = [];
let items = [];
let gameStarted = false;

// Генерация игрового поля
function generateBoard() {
    board = [];
    enemies = [];
    items = [];
    for (let y = 0; y < HEIGHT; y++) {
        let row = [];
        for (let x = 0; x < WIDTH; x++) {
            if (x === 0 || x === WIDTH - 1 || y === 0 || y === HEIGHT - 1) {
                row.push('|'); // стены
            } else if (x === playerPosition.x && y === playerPosition.y) {
                row.push('@'); // игрок
            } else if (Math.random() < 0.1) {
                row.push('§'); // враг
                enemies.push({
                    x, 
                    y, 
                    health: INITIAL_ENEMY_HEALTH + currentLevel - 1, 
                    damage: INITIAL_ENEMY_DAMAGE + currentLevel - 1
                });
            } else if (Math.random() < 0.1) {
                row.push('+'); // аптечка
            } else if (Math.random() < 0.1) {
                row.push('!'); // щит
            } else if (Math.random() < 0.1) {
                row.push('*'); // усиление урона
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
        playerHealth = Math.min(playerHealth + 5, MAX_HEALTH);
        log('Вы нашли аптечку. Здоровье восстановлено: ' + playerHealth);
        board[playerPosition.y][playerPosition.x] = '.';
    } else if (currentTile === '!') {
        activateShield();
        board[playerPosition.y][playerPosition.x] = '.';
    } else if (currentTile === '*') {
        playerDamage += 1;
        log('Вы нашли усиление урона! Урон увеличен до ' + playerDamage);
        board[playerPosition.y][playerPosition.x] = '.';
    } else if (currentTile === '>') {
        nextLevel();
    }
}

// Активация щита
function activateShield() {
    if (!hasShield) {
        hasShield = true;
        log('Щит активирован! Неуязвимость к урону.');
        setTimeout(() => {
            hasShield = false;
            log('Щит истек!');
        }, SHIELD_DURATION);
    } else {
        log('Щит уже активен!');
    }
}

// Переход на следующий уровень
function nextLevel() {
    currentLevel += 1;
    generateBoard();
    renderBoard();
    updateUI();
    log('Вы перешли на уровень ' + currentLevel);
}

// Обработка атаки врагов
function enemyAttack() {
    for (let enemy of enemies) {
        if (Math.abs(playerPosition.x - enemy.x) <= 1 && Math.abs(playerPosition.y - enemy.y) <= 1) {
            if (!hasShield) {
                playerHealth -= enemy.damage;
                if (playerHealth <= 0) {
                    playerHealth = 0;
                    log('💀 Вы погибли!');
                    alert('Game Over');
                    window.location.reload();
                } else {
                    log('Вас атакует враг! Ваше здоровье: ' + playerHealth);
                }
            }
        }
    }
}

// Атака врага при столкновении
function attackEnemy(x, y) {
    enemies = enemies.filter(enemy => {
        if (enemy.x === x && enemy.y === y) {
            enemy.health -= playerDamage;
            if (enemy.health <= 0) {
                log('Враг побежден!');
                return false;
            } else {
                return true;
            }
        }
        return true;
    });
}

// Обновление интерфейса
function updateUI() {
    document.getElementById('health').textContent = playerHealth;
    document.getElementById('max-health').textContent = MAX_HEALTH;
    document.getElementById('damage').textContent = playerDamage;
    document.getElementById('level').textContent = currentLevel;
    document.getElementById('enemy-count').textContent = enemies.length;
}

// Логирование событий
function log(message) {
    const logElement = document.getElementById('log');
    logElement.textContent += message + '\n';
    logElement.scrollTop = logElement.scrollHeight;
}

// Инициализация игры
function initializeGame() {
    generateBoard();
    renderBoard();
    updateUI();
    gameStarted = true;
}

// Установка обработчиков событий
document.getElementById('startButton').addEventListener('click', () => {
    if (!gameStarted) {
        initializeGame();
        document.getElementById('startButton').style.display = 'none';
    }
});

document.getElementById('moveUp').addEventListener('touchstart', () => movePlayer('up'));
document.getElementById('moveDown').addEventListener('touchstart', () => movePlayer('down'));
document.getElementById('moveLeft').addEventListener('touchstart', () => movePlayer('left'));
document.getElementById('moveRight').addEventListener('touchstart', () => movePlayer('right'));

document.getElementById('moveUp').addEventListener('mousedown', () => movePlayer('up'));
document.getElementById('moveDown').addEventListener('mousedown', () => movePlayer('down'));
document.getElementById('moveLeft').addEventListener('mousedown', () => movePlayer('left'));
document.getElementById('moveRight').addEventListener('mousedown', () => movePlayer('right'));
