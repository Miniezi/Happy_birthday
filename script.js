let score = 0;
let timeLeft = 30;
let timerInterval;

// Функция для обновления таймера
function updateTimer() {
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        document.getElementById('clickButton').disabled = true;
        alert('Время вышло! Ваш итоговый счёт: ' + score);
        return;
    }
    document.getElementById('timer').textContent = timeLeft;
    timeLeft--;
}

// Функция для обработки нажатия кнопки
function handleClick() {
    score++;
    document.getElementById('score').textContent = score;
}

// Настройка игры
function startGame() {
    document.getElementById('clickButton').addEventListener('click', handleClick);
    timerInterval = setInterval(updateTimer, 1000);
}

// Запуск игры
startGame();
