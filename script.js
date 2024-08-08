let health = 100;
let stamina = 100;
let morale = 100;

function updateStatus() {
    document.getElementById('health').textContent = health;
    document.getElementById('stamina').textContent = stamina;
    document.getElementById('morale').textContent = morale;
}

function log(message) {
    document.getElementById('log').textContent = message;
}

function gatherResources() {
    if (stamina > 10) {
        stamina -= 10;
        health -= 5;
        log('Вы собрали ресурсы. Здоровье и выносливость уменьшились.');
    } else {
        log('Вы слишком устали, чтобы собирать ресурсы.');
    }
    updateStatus();
}

function buildShelter() {
    if (stamina > 20) {
        stamina -= 20;
        morale += 10;
        log('Вы построили укрытие. Мораль улучшилась.');
    } else {
        log('У вас недостаточно выносливости для постройки укрытия.');
    }
    updateStatus();
}

function exploreIsland() {
    if (stamina > 30) {
        stamina -= 30;
        health -= 10;
        morale -= 5;
        log('Вы исследовали остров. Здоровье и мораль ухудшились.');
    } else {
        log('Вы слишком устали, чтобы исследовать остров.');
    }
    updateStatus();
}

// Изначальное обновление статуса
updateStatus();
