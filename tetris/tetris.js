// Глобальные переменные для управления игрой
let gameBoard;
let currentTetromino;
let currentTetrominoShape;
let currentTetrominoColor;
let currentTetrominoX;
let currentTetrominoY;

// Функция для отображения игрового поля тетриса
function renderGrid() {
  gameBoard = document.getElementById("game-board");

  // Очищаем игровое поле перед отображением
  gameBoard.innerHTML = "";

  // Создаем сетку игрового поля
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 10; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      gameBoard.appendChild(cell);
    }
  }
}

// Функция для генерации случайной фигуры
function generateRandomTetromino() {
  const tetrominoesKeys = Object.keys(tetrominoes);
  const randomIndex = Math.floor(Math.random() * tetrominoesKeys.length);
  const tetrominoKey = tetrominoesKeys[randomIndex];
  currentTetromino = tetrominoes[tetrominoKey];
  currentTetrominoShape = 0;
  currentTetrominoColor = tetrominoKey;
  currentTetrominoX = 3;
  currentTetrominoY = 0;
}

// Функция для рисования фигуры на игровом поле
function drawTetromino() {
  // Очищаем клетки, соответствующие предыдущему положению фигуры
  for (let i = 0; i < currentTetromino.length; i++) {
    const [x, y] = currentTetromino[i];
    const rowIndex = currentTetrominoY + y;
    const colIndex = currentTetrominoX + x;
    const cellIndex = rowIndex * 10 + colIndex;
    const cell = gameBoard.childNodes[cellIndex];
    cell.style.backgroundColor = "#333";
  }

  // Заполняем клетки, соответствующие текущему положению фигуры
  for (let i = 0; i < currentTetromino.length; i++) {
    const [x, y] = currentTetromino[i];
    const rowIndex = currentTetrominoY + y;
    const colIndex = currentTetrominoX + x;
    const cellIndex = rowIndex * 10 + colIndex;
    const cell = gameBoard.childNodes[cellIndex];
    cell.style.backgroundColor = colors[currentTetrominoColor];
  }
}

// Функция для движения фигуры влево
function moveTetrominoLeft() {
  currentTetrominoX--; // Уменьшаем координату X текущей фигуры
  if (checkCollisions()) {
    currentTetrominoX++; // Возвращаем координату X обратно, если произошла коллизия
  }
  drawTetromino(); // Перерисовываем фигуру после движения
}

// Функция для движения фигуры вправо
function moveTetrominoRight() {
  currentTetrominoX++; // Увеличиваем координату X текущей фигуры
  if (checkCollisions()) {
    currentTetrominoX--; // Возвращаем координату X обратно, если произошла коллизия
  }
  drawTetromino(); // Перерисовываем фигуру после движения
}

// Функция для обновления игрового поля
function updateGameBoard() {
  // Очищаем клетки, соответствующие предыдущему положению фигуры
  for (let i = 0; i < currentTetromino.length; i++) {
    const [x, y] = currentTetromino[i];
    const rowIndex = currentTetrominoY + y;
    const colIndex = currentTetrominoX + x;
    const cellIndex = rowIndex * 10 + colIndex;
    const cell = gameBoard.childNodes[cellIndex];
    cell.style.backgroundColor = "#333";
  }

  // Перерисовываем фигуру в её новом положении
  drawTetromino();
}


// Функция для проверки коллизий с другими фигурами и стенками игрового поля
function checkCollisions() {
  for (let i = 0; i < currentTetromino.length; i++) {
    const [x, y] = currentTetromino[i];
    const rowIndex = currentTetrominoY + y;
    const colIndex = currentTetrominoX + x;
    const cellIndex = rowIndex * 10 + colIndex;

    // Проверяем столкновения с другими фигурами
    if (rowIndex >= 20 || colIndex < 0 || colIndex >= 10 || gameBoard.childNodes[cellIndex].style.backgroundColor !== "") {
      return true;
    }
  }

  return false; // Нет коллизий, можно двигаться дальше
}


// Функция для удаления заполненных линий и обновления игрового поля
function removeFullLines() {
  let rowsToRemove = []; // Массив для хранения индексов заполненных линий

  // Проверяем каждую строку игрового поля
  for (let row = 0; row < 20; row++) {
    let isRowFull = true;

    // Проверяем, заполнена ли текущая строка
    for (let col = 0; col < 10; col++) {
      const cellIndex = row * 10 + col;
      const cell = gameBoard.childNodes[cellIndex];
      if (cell.style.backgroundColor === "") {
        isRowFull = false;
        break;
      }
    }

    // Если строка заполнена, добавляем её индекс в массив для удаления
    if (isRowFull) {
      rowsToRemove.push(row);
    }
  }

  // Удаляем заполненные строки и добавляем новые пустые сверху
  for (let i = rowsToRemove.length - 1; i >= 0; i--) {
    const rowToRemove = rowsToRemove[i];

    // Удаляем заполненную строку
    for (let col = 0; col < 10; col++) {
      const cellIndex = rowToRemove * 10 + col;
      const cell = gameBoard.childNodes[cellIndex];
      cell.style.backgroundColor = "";
    }

    // Сдвигаем все строки выше текущей вниз
    for (let row = rowToRemove - 1; row >= 0; row--) {
      for (let col = 0; col < 10; col++) {
        const cellIndex = row * 10 + col;
        const cell = gameBoard.childNodes[cellIndex];
        const cellAboveIndex = (row + 1) * 10 + col;
        const cellAbove = gameBoard.childNodes[cellAboveIndex];
        cell.style.backgroundColor = cellAbove.style.backgroundColor;
      }
    }
  }
}


// Функция для поворота фигуры
function rotateTetromino() {
  // Реализуйте логику для поворота фигуры
}

// Функция для начала игры
function startGame() {
  generateRandomTetromino(); // Генерируем случайную фигуру
  drawTetromino(); // Рисуем фигуру на игровом поле

  // Установите интервал для движения фигуры вниз каждые 1000 миллисекунд (1 секунда)
  const gameInterval = setInterval(() => {
    moveTetrominoDown(); // Двигаем фигуру вниз

    // Проверяем, произошла ли коллизия после движения вниз
    if (checkCollisions()) {
      clearInterval(gameInterval); // Останавливаем игровой интервал
      removeFullLines(); // Удаляем заполненные линии
      startGame(); // Запускаем новую игру (рекурсивно вызываем эту функцию)
    }
  }, 1000); // Интервал движения фигуры вниз (1000 миллисекунд = 1 секунда)
}


// Функция для обработки касаний на мобильных устройствах
function setupTouchControls() {
  let startX, startY;

  gameBoard.addEventListener("touchstart", (event) => {
    startX = event.touches[0].pageX;
    startY = event.touches[0].pageY;
  });

  gameBoard.addEventListener("touchend", (event) => {
    const endX = event.changedTouches[0].pageX;
    const endY = event.changedTouches[0].pageY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Горизонтальное движение
      if (deltaX > 0) {
        moveTetrominoRight(); // Двигаем фигуру вправо
      } else {
        moveTetrominoLeft(); // Двигаем фигуру влево
      }
    } else {
      // Вертикальное движение
      if (deltaY > 0) {
        moveTetrominoDown(); // Двигаем фигуру вниз
      } else {
        rotateTetromino(); // Поворачиваем фигуру
      }
    }
  });
}


// Пример кода для обработки нажатия кнопки "Старт"
const startButton = document.getElementById("start-button");
startButton.addEventListener("click", () => {
  renderGrid();
  setupTouchControls();
  startGame();
});
