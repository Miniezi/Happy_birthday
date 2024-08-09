const WIDTH = 10;
const HEIGHT = 10;
const INITIAL_ENEMY_HEALTH = 5;
const INITIAL_ENEMY_DAMAGE = 1;
const INITIAL_PLAYER_HEALTH = 20;
const INITIAL_PLAYER_DAMAGE = 2;
const SHIELD_DURATION = 10000; // 10 seconds

let player = {
    x: Math.floor(WIDTH / 2),
    y: 0,
    health: INITIAL_PLAYER_HEALTH,
    maxHealth: INITIAL_PLAYER_HEALTH,
    damage: INITIAL_PLAYER_DAMAGE,
};

let enemies = [];
let board = [];
let currentLevel = 1;
let gameStarted = false;
let darkTheme = false;
let language = 'en';

const translations = {
    en: {
        health: 'HP',
        damage: 'Damage',
        level: 'Level',
        enemies: 'Enemies',
        start: 'Start',
        toggleTheme: 'Toggle Theme',
        toggleLanguage: 'Switch to Russian',
        shieldActivated: 'Shield activated!',
        shieldExpired: 'Shield expired.',
        enemyDefeated: 'Enemy defeated!',
        attackedByEnemy: 'You were attacked by an enemy!',
        youDied: 'You died!',
        levelUp: 'Level up! Now on level ',
        foundHealthPack: 'You found a health pack!',
        foundShield: 'You found a shield!',
        increasedDamage: 'Your damage has increased!',
    },
    ru: {
        health: 'Здоровье',
        damage: 'Урон',
        level: 'Уровень',
        enemies: 'Враги',
        start: 'Начать',
        toggleTheme: 'Переключить тему',
        toggleLanguage: 'Переключить на английский',
        shieldActivated: 'Щит активирован!',
        shieldExpired: 'Щит истек.',
        enemyDefeated: 'Враг побежден!',
        attackedByEnemy: 'Вы подверглись атаке врага!',
        youDied: 'Вы умерли!',
        levelUp: 'Повышение уровня! Теперь на уровне ',
        foundHealthPack: 'Вы нашли аптечку!',
        foundShield: 'Вы нашли щит!',
        increasedDamage: 'Ваш урон увеличен!',
    },
};

function generateBoard() {
    board = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill('.'));
    enemies = [];

    board[player.y][player.x] = '@';
    
    for (let y = 1; y < HEIGHT - 1; y++) {
        for (let x = 1; x < WIDTH - 1; x++) {
            if (Math.random() < 0.1) {
                board[y][x] = '§';
                enemies.push({ x, y, health: INITIAL_ENEMY_HEALTH + currentLevel - 1, damage: INITIAL_ENEMY_DAMAGE + currentLevel - 1 });
            } else if (Math.random() < 0.05) {
                board[y][x] = '+';
            } else if (Math.random() < 0.05) {
                board[y][x] = '!';
            } else if (Math.random() < 0.05) {
                board[y][x] = '*';
            }
        }
    }

    board[HEIGHT - 2][Math.floor(WIDTH / 2)] = '>';
}

function renderBoard() {
    let display = board.map(row => row.join('')).join('\n');
    document.getElementById('gameBoard').textContent = display;
}

function movePlayer(dx, dy) {
    let newX = player.x + dx;
    let newY = player.y + dy;

    if (newX >= 0 && newX < WIDTH && newY >= 0 && newY < HEIGHT) {
        if (board[newY][newX] === '§') {
            attackEnemy(newX, newY);
        } else if (board[newY][newX] === '>') {
            nextLevel();
        } else if (board[newY][newX] === '+') {
            player.health = Math.min(player.health + 5, player.maxHealth);
            log(translations[language].foundHealthPack);
        } else if (board[newY][newX] === '!') {
            activateShield();
            log(translations[language].foundShield);
        } else if (board[newY][newX] === '*') {
            player.damage += 1;
            log(translations[language].increasedDamage);
        } else {
            board[player.y][player.x] = '.';
            player.x = newX;
            player.y = newY;
            board[player.y][player.x] = '@';
        }

        updateEnemies();
        renderBoard();
        updateStats();
        enemyAttack();
    }
}

function attackEnemy(x, y) {
    enemies = enemies.filter(enemy => {
        if (enemy.x === x && enemy.y === y) {
            enemy.health -= player.damage;
            if (enemy.health <= 0) {
                log(translations[language].enemyDefeated);
                return false;
            } else {
                return true;
            }
        }
        return true;
    });
}

function updateEnemies() {
    enemies.forEach(enemy => {
        if (Math.abs(player.x - enemy.x) <= 1 && Math.abs(player.y - enemy.y) <= 1) {
            attackEnemy(enemy.x, enemy.y);
        } else {
            let direction = Math.random();
            let newX = enemy.x;
            let newY = enemy.y;

            if (direction < 0.25 && enemy.y > 0) newY--;
            else if (direction < 0.5 && enemy.y < HEIGHT - 1) newY++;
            else if (direction < 0.75 && enemy.x > 0) newX--;
            else if (enemy.x < WIDTH - 1) newX++;

            if (board[newY][newX] === '.') {
                board[enemy.y][enemy.x] = '.';
                enemy.x = newX;
                enemy.y = newY;
                board[enemy.y][enemy.x] = '§';
            }
        }
    });
}

function enemyAttack() {
    enemies.forEach(enemy => {
        if (Math.abs(player.x - enemy.x) <= 1 && Math.abs(player.y - enemy.y) <= 1) {
            player.health -= enemy.damage;
            log(translations[language].attackedByEnemy);

            if (player.health <= 0) {
                log(translations[language].youDied);
                gameStarted = false;
                document.getElementById('startButton').style.display = 'block';
            }
        }
    });
    updateStats();
}

function nextLevel() {
    currentLevel++;
    log(translations[language].levelUp + currentLevel);
    player.x = Math.floor(WIDTH / 2);
    player.y = 0;
    generateBoard();
    renderBoard();
}

function updateStats() {
    document.getElementById('health').textContent = player.health;
    document.getElementById('maxHealth').textContent = player.maxHealth;
    document.getElementById('damage').textContent = player.damage;
    document.getElementById('level').textContent = currentLevel;
    document.getElementById('enemyCount').textContent = enemies.length;
}

function log(message) {
    const logElement = document.getElementById('log');
    logElement.textContent += message + '\n';
    logElement.scrollTop = logElement.scrollHeight;
}

function activateShield() {
    log(translations[language].shieldActivated);
    setTimeout(() => {
        log(translations[language].shieldExpired);
    }, SHIELD_DURATION);
}

function initializeGame() {
    player = {
        x: Math.floor(WIDTH / 2),
        y: 0,
        health: INITIAL_PLAYER_HEALTH,
        maxHealth: INITIAL_PLAYER_HEALTH,
        damage: INITIAL_PLAYER_DAMAGE,
    };
    currentLevel = 1;
    generateBoard();
    renderBoard();
    updateStats();
    gameStarted = true;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = translations[language][key];
    });
}

document.getElementById('startButton').addEventListener('click', () => {
    if (!gameStarted) {
        initializeGame();
        document.getElementById('startButton').style.display = 'none';
    }
});

document.getElementById('themeToggle').addEventListener('click', () => {
    darkTheme = !darkTheme;
    document.body.classList.toggle('dark', darkTheme);
});

document.getElementById('languageToggle').addEventListener('click', () => {
    language = language === 'en' ? 'ru' : 'en';
    applyTranslations();
    document.getElementById('languageToggle').textContent = language === 'en' 
        ? 'Switch to Russian' 
        : 'Переключить на английский';
});

document.getElementById('moveUp').addEventListener('touchstart', () => movePlayer(0, -1));
document.getElementById('moveDown').addEventListener('touchstart', () => movePlayer(0, 1));
document.getElementById('moveLeft').addEventListener('touchstart', () => movePlayer(-1, 0));
document.getElementById('moveRight').addEventListener('touchstart', () => movePlayer(1, 0));

document.getElementById('moveUp').addEventListener('mousedown', () => movePlayer(0, -1));
document.getElementById('moveDown').addEventListener('mousedown', () => movePlayer(0, 1));
document.getElementById('moveLeft').addEventListener('mousedown', () => movePlayer(-1, 0));
document.getElementById('moveRight').addEventListener('mousedown', () => movePlayer(1, 0));

applyTranslations();
