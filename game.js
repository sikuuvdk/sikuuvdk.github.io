let currentWordObj = null;
let currentWord = "";
let guessedLetters = [];
let mistakes = 0;
let score = 100;
let hintsLeft = 3;
let combo = 0;
let gameActive = true;
let currentDifficulty = "normal";
let maxMistakes = 5;
let currentFlower = "🌻";
const flowerByDifficulty = { easy: { max:7, emoji:"🌹", img:"rose.png" }, normal: { max:5, emoji:"🌼", img:"chamomile.png" }, hard:{ max:3, emoji:"🔔", img:"bell.png" } };
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('gameSettings'));
    if(settings) {
        currentDifficulty = settings.difficulty;
        maxMistakes = flowerByDifficulty[currentDifficulty].max;
        currentFlower = flowerByDifficulty[currentDifficulty].emoji;
        const flowerImage = document.getElementById('flower-image');
        if(flowerImage) {
            flowerImage.src = flowerByDifficulty[currentDifficulty].img;
        }
        const petalsCount = document.getElementById('petals-count');
        if(petalsCount) petalsCount.textContent = `Лепестков: ${maxMistakes - mistakes}`;
    }
}
function initGame() {
    currentWordObj = getRandomWord();
    currentWord = currentWordObj.word.toUpperCase();
    guessedLetters = [];
    mistakes = 0;
    score = 100;
    hintsLeft = 3;
    combo = 0;
    gameActive = true;
    updateUI();
    generateKeyboard();
    const hintBtn = document.getElementById('hint-button');
    if(hintBtn) {
        hintBtn.disabled = false;
        hintBtn.textContent = `💡 Подсказка (${hintsLeft})`;
    }
    const comboIndicator = document.getElementById('combo-indicator');
    if(comboIndicator) comboIndicator.innerHTML = "";
    
    const flowerImage = document.getElementById('flower-image');
    if(flowerImage) flowerImage.classList.remove('glow');
}
function updateUI() {
    if(!gameActive) return;
    const masked = currentWord.split('').map(l => guessedLetters.includes(l) ? l : '_').join(' ');
    const wordMask = document.getElementById('word-mask');
    if(wordMask) wordMask.innerHTML = masked;
    const scoreSpan = document.getElementById('score');
    if(scoreSpan) scoreSpan.textContent = score;
    const mistakesSpan = document.getElementById('mistakes');
    if(mistakesSpan) mistakesSpan.textContent = mistakes;
    const petalsSpan = document.getElementById('petals-count');
    if(petalsSpan) petalsSpan.textContent = `Лепестков: ${maxMistakes - mistakes}`;
    const comboSpan = document.getElementById('combo');
    if(comboSpan) comboSpan.textContent = combo;
    const flowerImage = document.getElementById('flower-image');
    const comboIndicator = document.getElementById('combo-indicator');
    if(combo >= 2) {
        if(flowerImage) flowerImage.classList.add('glow');
        if(comboIndicator) comboIndicator.innerHTML = "✨ Цветок сияет (комбо)! ✨";
    } else {
        if(flowerImage) flowerImage.classList.remove('glow');
        if(comboIndicator) comboIndicator.innerHTML = "";
    }
    if(currentWord.split('').every(l => guessedLetters.includes(l))) {
        gameActive = false;
        score += 50;
        updateUI();
        showModal(`🎉 Победа! Вы спасли цветок! +50 очков. Финальный счёт: ${score} 🎉`, true);
        updateAchievements();
        return;
    }
    if(mistakes >= maxMistakes) {
        gameActive = false;
        showModal(`💀 Увы... цветок завял. Загаданное слово: ${currentWord}. Счёт: ${score}`, false);
        updateAchievements();
        return;
    }
    if(score <= 30) {
        gameActive = false;
        showModal(`⚠️ Недостаточно очков (<=30). Вы проиграли. Слово: ${currentWord}`, false);
        updateAchievements();
    }
}
function handleGuess(letter) {
    if(!gameActive) return;
    if(guessedLetters.includes(letter)) return;
    guessedLetters.push(letter);
    const isCorrect = currentWord.includes(letter);
    if(isCorrect) {
        let addPoints = 10;
        score += addPoints;
        combo++;
        updateUI();
        const keyDiv = document.querySelector(`.key[data-letter='${letter}']`);
        if(keyDiv) {
            keyDiv.style.background = "var(--correct-color)";
            setTimeout(() => { if(keyDiv) keyDiv.style.background = ""; }, 300);
        }
    } else {
        mistakes++;
        score = Math.max(0, score - 5);
        combo = 0;
        updateUI();
        const flowerImage = document.getElementById('flower-image');
        if(flowerImage) {
            flowerImage.style.transform = "rotate(5deg)";
            setTimeout(() => { if(flowerImage) flowerImage.style.transform = ""; }, 200);
        }
        if(mistakes >= 2 && mistakes % 2 === 0) {
            fetchFactAsync(currentWordObj.fact);
        }
    }
    updateKeyboardUI();
    updateUI();
}
function fetchFactAsync(factText) {
    return new Promise((resolve) => {
        setTimeout(() => {
            showModal(`🌱 Интересный факт: ${factText} 🌱`, false, 4000);
            resolve(true);
        }, 100);
    });
}
function showModal(message, isVictory=false, autoClose=3000) {
    const existingOverlay = document.querySelector('.overlay');
    if(existingOverlay) return;
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `<p>${message}</p><button id="close-modal">Понятно</button>`;
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    const close = () => {
        overlay.remove();
        modal.remove();
    };
    const closeBtn = document.getElementById('close-modal');
    if(closeBtn) closeBtn.onclick = close;
    if(autoClose && !isVictory) setTimeout(close, autoClose);
}
function updateKeyboardUI() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        const letter = key.getAttribute('data-letter');
        if(guessedLetters.includes(letter)) {
            key.classList.add('used');
        }
    });
}
function generateKeyboard() {
    const ruLetters = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split('');
    const kb = document.getElementById('keyboard');
    if(!kb) return;
    kb.innerHTML = '';
    ruLetters.forEach(l => {
        const btn = document.createElement('div');
        btn.className = 'key';
        btn.textContent = l;
        btn.setAttribute('data-letter', l);
        btn.onclick = () => handleGuess(l);
        kb.appendChild(btn);
    });
}
const guessBtn = document.getElementById('guess-word-btn');
if(guessBtn) {
    guessBtn.addEventListener('click', () => {
        if(!gameActive) return;
        const userWord = prompt("Введите слово целиком (заглавными буквами):");
        if(userWord && userWord.toUpperCase() === currentWord) {
            score += 50;
            updateUI();
            showModal(`🎉 Совершенно верно! +50 очков! Слово: ${currentWord}`, true);
            gameActive = false;
            updateUI();
            updateAchievements();
        } else if(userWord) {
            mistakes++;
            score = Math.max(0, score - 10);
            updateUI();
            showModal(`Неверно! Слово не "${userWord}". -10 очков.`, false);
            if(mistakes >= maxMistakes) updateUI();
        }
    });
}
const hintBtn = document.getElementById('hint-button');
if(hintBtn) {
    hintBtn.addEventListener('click', () => {
        if(!gameActive) return;
        if(hintsLeft <= 0) { showModal("Нет подсказок!", false, 1500); return; }
        const unguessed = currentWord.split('').filter(l => !guessedLetters.includes(l));
        if(unguessed.length === 0) return;
        const randomLetter = unguessed[Math.floor(Math.random() * unguessed.length)];
        if(!guessedLetters.includes(randomLetter)) {
            guessedLetters.push(randomLetter);
            hintsLeft--;
            hintBtn.textContent = `💡 Подсказка (${hintsLeft})`;
            updateUI();
            showModal(`🌿 Открыта буква "${randomLetter}"!`, false, 1800);
            updateKeyboardUI();
            if(currentWord.split('').every(l => guessedLetters.includes(l))) updateUI();
        }
    });
}
const resetBtn = document.getElementById('reset-game-btn');
if(resetBtn) {
    resetBtn.addEventListener('click', () => {
        initGame();
    });
}
function updateAchievements() {
    let achieves = JSON.parse(localStorage.getItem('gameAchievements')) || {
        maxScore: 0,
        loseCount: 0,
        noHintWin: false,
        allHintsUsed: false,
        comboMaster: false
    };
    if(score > achieves.maxScore) achieves.maxScore = score;
    if(!gameActive && mistakes >= maxMistakes) achieves.loseCount++;
    if(gameActive === false && currentWord.split('').every(l => guessedLetters.includes(l)) && hintsLeft === 3) achieves.noHintWin = true;
    if(hintsLeft === 0) achieves.allHintsUsed = true;
    if(combo >= 4) achieves.comboMaster = true;
    localStorage.setItem('gameAchievements', JSON.stringify(achieves));
}
const toggleTheme = document.getElementById('theme-toggle');
if(toggleTheme) {
    const curr = localStorage.getItem('theme');
    if(curr === 'dark') document.body.classList.add('dark');
    if(curr === 'dark') toggleTheme.checked = true;
    toggleTheme.addEventListener('change', () => {
        if(toggleTheme.checked) { document.body.classList.add('dark'); localStorage.setItem('theme','dark');}
        else { document.body.classList.remove('dark'); localStorage.setItem('theme','light');}
    });
}
loadSettings();
initGame();