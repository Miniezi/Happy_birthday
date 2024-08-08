const WIDTH = 10;
const HEIGHT = 10;
let playerPosition = { x: 1, y: 1 };
let playerHealth = 100;
let maxHealth = 100;
let playerDamage = 10;
let currentLevel = 1;
let board = [];

// Функция для генерации игрового поля
function generateBoard() {
    board = [];
    for (let y = 0; y < HEIGHT; y++) {
        let row = [];
        for (let x = 0; x < WIDTH; x++) {
            if (x === 0 || x === WIDTH - 1 || y === 0 || y === HEIGHT - 1) {
                row.push('|'); // стены
            } else if (x === playerPosition.x && y === playerPosition.y) {
                row.push('@'); // игрок
            } else if (Math.random() < 0.05 * currentLevel) {
                row.push('§'); // враг
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

// Функция для отображения игрового поля
function renderBoard() {
    let display = board.map(row => row.join('')).join('\n');
    document.getElementById('gameBoard').textContent = display;
}

// Функция для перемещения игрока
function movePlayer(direction) {
    const newPosition = { ...playerPosition };

    if (direction === 'up') newPosition.y -= 1;
    if (direction === 'down') newPosition.y += 1;
    if (direction === 'left') newPosition.x -= 1;
    if (direction === 'right') newPosition.x += 1;

    if (isValidMove(newPosition)) {
        playerPosition = newPosition;
        handleInteraction();
        updateBoard();
        renderBoard();
        updateUI();
    }
}

// Проверка на допустимость перемещения
function isValidMove(position) {
    return position.x > 0 && position.x < WIDTH - 1 &&
           position.y > 0 && position.y < HEIGHT - 1;
}

// Обработка взаимодействия с текущей ячейкой
function handleInteraction() {
    let currentTile = board[playerPosition.y][playerPosition.x];

    if (currentTile === '§') {
        playerHealth -= 20;
        log('Вы были атакованы врагом! Здоровье: ' + playerHealth);
        if (Math.random() < 0.3) { // 30% шанс на получение бафа урона
            playerDamage += 5;
            log('Вы получили баф на урон! Урон: ' + playerDamage);
        }
    } else if (currentTile === '+') {
        playerHealth = Math.min(playerHealth + 20, maxHealth);
        log('Вы нашли аптечку. Здоровье восстановлено: ' + playerHealth);
    } else if (currentTile === '!') {
        activateTemporaryBoost();
    } else if (currentTile === '$') {
        applyPermanentBoost();
    } else if (currentTile === '>') {
        nextLevel();
    }
}

// Функция активации временного усиления
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

// Функция применения постоянного усиления
function applyPermanentBoost() {
    let rand = Math.random();
    if (rand < 0.5) {
        maxHealth += 20;
        playerHealth = maxHealth;
        log('Максимальное здоровье увеличено до ' + maxHealth + '!');
    } else {
        playerDamage += 5;
        log('Ваш урон увеличен до ' + playerDamage + '!');
    }
    updateUI();
}

// Функция перехода на следующий уровень
function nextLevel() {
    currentLevel++;
    playerPosition = { x: 1, y: 1 }; // возвращаем игрока на начальную позицию
    log('Вы перешли на уровень ' + currentLevel + '! Враги стали сильнее.');
    generateBoard();
    renderBoard();
    updateUI();
}

// Функция для обновления состояния доски и интерфейса
function updateBoard() {
    // Очищаем доску
    board = board.map(row => row.map(cell => (cell === '@' ? '.' : cell)));

    // Устанавливаем новую позицию игрока
    board[playerPosition.y][playerPosition.x] = '@';
}

// Функция для обновления характеристик персонажа
function updateUI() {
    document.getElementById('health').textContent = playerHealth;
    document.getElementById('damage').textContent = playerDamage;
    document.getElementById('level').textContent = currentLevel;
}

// Функция для отображения сообщений
function log(message) {
    document.getElementById('log').textContent = message;
}

// Изначальный рендер
generateBoard();
renderBoard();
updateUI();
