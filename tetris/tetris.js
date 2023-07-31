const canvas = document.getElementById("tetrisCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 20;
const cols = 10;
const rows = 20;
let blockSize;
let gameSpeed = 800;
let gameInterval;
let score = 0;
let level = 1;
let time = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Функция для получения размера холста и обновления его при изменении ориентации устройства.
function resizeCanvas() {
    const { innerWidth, innerHeight } = window;
    const size = Math.min(innerWidth, innerHeight);
    blockSize = Math.floor(size / cols);
    canvas.width = blockSize * cols;
    canvas.height = blockSize * rows;
}

// Функция для генерации новой фигуры
function spawnPiece() {
    const randomShapeIndex = Math.floor(Math.random() * shapes.length);
    const randomColorIndex = Math.floor(Math.random() * colors.length);
    const piece = shapes[randomShapeIndex];
    tetris.currentPiece = {
        shape: piece,
        color: randomColorIndex + 1,
    };
    tetris.currentPosition.x = Math.floor((cols - piece[0].length) / 2);
    tetris.currentPosition.y = 0;
    tetris.currentColor = colors[randomColorIndex];
}

// Функция для движения фигуры вниз
function moveDown() {
    tetris.currentPosition.y++;
    if (isColliding(tetris.currentPosition.x, tetris.currentPosition.y, tetris.currentPiece.shape)) {
        tetris.currentPosition.y--;
        mergePieceIntoGrid();
        const rowsCleared = clearRows();
        if (rowsCleared > 0) {
            score += 100 * (2 ** (rowsCleared - 1));
            updateScoreboard();
        }
        spawnPiece();
        if (isColliding(tetris.currentPosition.x, tetris.currentPosition.y, tetris.currentPiece.shape)) {
            // Игра окончена
            gameOver();
            return;
        }
    }
}

// Функция для движения фигуры влево
function moveLeft() {
    tetris.currentPosition.x--;
    if (isColliding(tetris.currentPosition.x, tetris.currentPosition.y, tetris.currentPiece.shape)) {
        tetris.currentPosition.x++;
    }
}

// Функция для движения фигуры вправо
function moveRight() {
    tetris.currentPosition.x++;
    if (isColliding(tetris.currentPosition.x, tetris.currentPosition.y, tetris.currentPiece.shape)) {
        tetris.currentPosition.x--;
    }
}

// Функция для поворота фигуры
function rotate() {
    const rotatedPiece = rotatePiece(tetris.currentPiece.shape);
    if (!isColliding(tetris.currentPosition.x, tetris.currentPosition.y, rotatedPiece)) {
        tetris.currentPiece.shape = rotatedPiece;
    }
}

// Функция для обработки нажатий клавиш
function handleKeyPress(event) {
    switch (event.code) {
        case "ArrowUp":
            rotate();
            break;
        case "ArrowLeft":
            moveLeft();
            break;
        case "ArrowRight":
            moveRight();
            break;
        case "ArrowDown":
            moveDown();
            break;
    }
}

// Функция для обновления очков и уровня на доске
function updateScoreboard() {
    document.getElementById("score").textContent = "Score: " + score;
    document.getElementById("level").textContent = "Level: " + level;
}

// Функция для отрисовки блока на холсте
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    ctx.strokeStyle = "white";
    ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

// Функция для отрисовки сетки игрового поля
function drawGrid() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const colorIndex = tetris.grid[y][x];
            drawBlock(x, y, colors[colorIndex]);
        }
    }
}

// Функция для отрисовки текущей фигуры
function drawCurrentPiece() {
    const { shape, color } = tetris.currentPiece;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x] !== 0) {
                drawBlock(
                    tetris.currentPosition.x + x,
                    tetris.currentPosition.y + y,
                    colors[color]
                );
            }
        }
    }
}

// Функция для проверки коллизий фигуры с другими блоками или краями поля
function isColliding(x, y, piece) {
    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
            if (
                piece[row][col] &&
                (tetris.grid[y + row] && tetris.grid[y + row][x + col]) !== 0
            ) {
                return true;
            }
        }
    }
    return false;
}

// Функция для поворота фигуры
function rotatePiece(piece) {
    const rotatedPiece = [];
    for (let y = 0; y < piece[0].length; y++) {
        rotatedPiece.push([]);
        for (let x = 0; x < piece.length; x++) {
            rotatedPiece[y].unshift(piece[x][y]);
        }
    }
    return rotatedPiece;
}

// Функция для объединения фигуры в сетке
function mergePieceIntoGrid() {
    const { shape, color } = tetris.currentPiece;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x] !== 0) {
                tetris.grid[tetris.currentPosition.y + y][tetris.currentPosition.x + x] = color;
            }
        }
    }
}

// Функция для очистки заполненных рядов и подсчета очков и уровня
function clearRows() {
    let rowsCleared = 0;
    for (let y = tetris.grid.length - 1; y >= 0; y--) {
        if (tetris.grid[y].every((cell) => cell !== 0)) {
            tetris.grid.splice(y, 1);
            tetris.grid.unshift(new Array(cols).fill(0));
            rowsCleared++;
        }
    }
    if (rowsCleared > 0) {
        score += 100 * (2 ** (rowsCleared - 1));
        updateScoreboard();
        time -= 5; // Уменьшаем время игры при каждом удалении ряда (дополнение)
        if (time < 0) time = 0;
        level = Math.ceil(score / 1000); // Увеличиваем уровень при достижении определенного количества очков (дополнение)
        gameSpeed = 800 - (level * 50); // Увеличиваем скорость игры с уровнем (дополнение)
        clearInterval(gameInterval);
        gameInterval = setInterval(update, gameSpeed);
    }
    return rowsCleared;
}

// Функция для отображения сообщения об окончании игры
function gameOver() {
    clearInterval(gameInterval);
    alert("Game Over! Your score: " + score);
}

// Функция для обновления игры
function update() {
    moveDown();
    draw();
    time++; // Увеличиваем время игры на каждом шаге (дополнение)
    document.getElementById("time").textContent = "Time: " + time; // Обновляем время на доске (дополнение)
}

// Функция для отрисовки игры
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawCurrentPiece();
}

// Функция для старта игры
function startGame() {
    score = 0;
    level = 1;
    time = 0;
    tetris.grid = createGrid(cols, rows);
    spawnPiece();
    updateScoreboard();
    gameInterval = setInterval(update, gameSpeed);
}

// Функция для создания пустой сетки игрового поля
function createGrid(cols, rows) {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
}

// Функция для обработки касаний на мобильных устройствах
function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;
    handleSwipe();
}

function handleSwipe() {
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 100) {
        if (absDx > absDy) {
            if (dx > 0) {
                moveRight();
            } else {
                moveLeft();
            }
        } else {
            if (dy > 0) {
                moveDown();
            } else {
                rotate();
            }
        }
    }
}

// Главный игровой цикл
function gameLoop() {
    startGame();
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
}

// Инициализация игры
function init() {
    resizeCanvas();
    document.addEventListener("keydown", handleKeyPress);
    gameLoop();
}

document.addEventListener("DOMContentLoaded", init);
