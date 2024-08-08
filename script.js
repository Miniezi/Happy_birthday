const WIDTH = 10;
const HEIGHT = 10;
let playerPosition = { x: 1, y: 1 };
let playerHealth = 100;
let maxHealth = 100;
let temporaryBoosts = {
    speed: false,
    protection: false
};
let board = [];

function generateBoard() {
    board = [];
    for (let y = 0; y < HEIGHT; y++) {
        let row = [];
        for (let x = 0; x < WIDTH; x++) {
            if (x === 0 || x === WIDTH - 1 || y === 0 || y === HEIGHT - 1) {
                row.push('|'); // стены
            } else if (x === playerPosition.x && y === playerPosition.y) {
                row.push('@'); // игрок
            } else {
                let rand = Math.random();
                if (rand < 0.05) {
                    row.push('§'); // враг
                } else if (rand < 0.1) {
                    row.push('+'); // предмет, восстанавливающий здоровье
                } else if (rand < 0.15) {
                    row.push('!'); // временное усиление
                } else if (rand < 0.18) {
                    row.push('$'); // постоянное усиление
                } else {
                    row.push('.'); // пустое место
                }
            }
        }
        board.push(row);
    }
}

function renderBoard() {
    let display = board.map(row => row.join('')).join('\n');
    document.getElementById('gameBoard').textContent = display;
}

function movePlayer(direction) {
    const newPosition = { ...playerPosition };

    if (direction === 'up') newPosition.y -= 1;
    if (direction === 'down') newPosition.y += 1;
    if (direction === 'left') newPosition.x -= 1;
    if (direction === 'right') newPosition.x += 1;

    if (isValidMove(newPosition)) {
        playerPosition = newPosition;
        handleInteraction();
    }

    renderBoard();
}

function isValidMove(position) {
    return position.x > 0 && position.x < WIDTH - 1 &&
           position.y > 0 && position.y < HEIGHT - 1;
}

function handleInteraction() {
    let currentTile = board[playerPosition.y][playerPosition.x];

    if (currentTile === '§') {
        if (temporaryBoosts.protection) {
            log('Вы избежали атаки врага благодаря защите!');
        } else {
            playerHealth -= 20;
            log('Вы были атакованы врагом! Здоровье: ' + playerHealth);
        }
    } else if (currentTile === '+') {
        playerHealth = Math.min(playerHealth + 20, maxHealth);
        log('Вы нашли аптечку. Здоровье восстановлено: ' + playerHealth);
    } else if (currentTile === '!') {
        activateTemporaryBoost();
    } else if (currentTile === '$') {
        applyPermanentBoost();
    }

    board[playerPosition.y][playerPosition.x] = '.';
}

function activateTemporaryBoost() {
    let rand = Math.random();
    if (rand < 0.5) {
        temporaryBoosts.speed = true;
        log('Вы получили временное ускорение!');
        setTimeout(() => {
            temporaryBoosts.speed = false;
            log('Эффект ускорения закончился.');
        }, 5000);
    } else {
        temporaryBoosts.protection = true;
        log('Вы получили временную защиту!');
        setTimeout(() => {
            temporaryBoosts.protection = false;
            log('Эффект защиты закончился.');
        }, 5000);
    }
}

function applyPermanentBoost() {
    let rand = Math.random();
    if (rand < 0.5) {
        maxHealth += 20;
        playerHealth = maxHealth;
        log('Максимальное здоровье увеличено до ' + maxHealth + '!');
    } else {
        log('Ваши способности улучшены!');
        // Можно добавить другие постоянные усиления по желанию
    }
}

function log(message) {
    document.getElementById('log').textContent = message;
}

// Изначальный рендер
generateBoard();
renderBoard();
