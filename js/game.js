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
let perfectGameAchievementGranted = false;
let factShownThisGame = false;
let factButtonEnabled = false;

const flowerByDifficulty = { 
    easy: { max:7, img:"images/rose.png", fadingImg:"images/rose-fading.png" }, 
    normal: { max:5, img:"images/chamomile.png", fadingImg:"images/chamomile-fading.png" }, 
    hard:{ max:3, img:"images/bell.png", fadingImg:"images/bell-fading.png" } 
};

const wordDescriptions = {
    "САДОВОД": "Это человек, который помогает растениям расти и плодоносить, ухаживая за ними с весны до осени. Он знает, как правильно обрезать ветки, поливать кусты и бороться с вредителями. Благодаря его труду на участке появляются яблоки, смородина и душистые цветы.",
    "РОМАШКА": "Это полевой цветок с белыми лепестками и жёлтой серединкой. Часто используется в народной медицине и символизирует русскую природу. Его цветы закрываются на ночь, а утром снова раскрываются.",
    "ПОДСОЛНУХ": "Это высокое растение с крупной жёлтой головкой, наполненной семечками. Оно поворачивается вслед за солнцем, но только до момента цветения. Из его семян делают масло и вкусные козинаки.",
    "ОРАНЖЕРЕЯ": "Это стеклянное сооружение для выращивания теплолюбивых растений. Первые такие постройки появились ещё в Древнем Риме. Внутри поддерживается особый микроклимат, позволяющий плодоносить лимонам и апельсинам даже в холодных странах.",
    "ФЛОРАРИУМ": "Это миниатюрный сад в стеклянной ёмкости, который поливают всего раз в несколько месяцев. Внутри создаётся замкнутая экосистема, где растения живут в собственном маленьком мире."
};

const interestingFactsWithoutWord = {
    "САДОВОД": "🌱 Интересный факт: эта профессия существует уже более 10 000 лет! Они появились вместе с первыми огородами в древних цивилизациях.",
    "РОМАШКА": "🌸 Интересный факт: этот цветок — символ русской природы. Он закрывает свои лепестки на ночь и снова раскрывает их утром!",
    "ПОДСОЛНУХ": "🌻 Интересный факт: это растение поворачивается вслед за солнцем, но только до того момента, как распустится его цветок!",
    "ОРАНЖЕРЕЯ": "🏠 Интересный факт: первые такие сооружения появились в Древнем Риме для выращивания экзотических фруктов!",
    "ФЛОРАРИУМ": "🔮 Интересный факт: это сад в стекле, который поливают всего раз в несколько месяцев — внутри создаётся замкнутая экосистема!"
};

function updateWordDescription() {
    const descElement = document.getElementById('desc-placeholder');
    if (!descElement) return;
    
    if (currentWordObj && wordDescriptions[currentWordObj.word]) {
        descElement.textContent = wordDescriptions[currentWordObj.word];
    } else if (currentWordObj) {
        descElement.textContent = "Это слово связано с миром растений и садоводства. Попробуй угадать его по буквам! 🌱";
    } else {
        descElement.textContent = "Загрузка описания...";
    }
}

function updateFactButtonVisibility() {
    const factButton = document.getElementById('fact-button');
    if (factButton) {
        if (factButtonEnabled && gameActive) {
            factButton.classList.remove('fact-btn-hidden');
        } else {
            factButton.classList.add('fact-btn-hidden');
        }
    }
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('gameSettings'));
    if(settings) {
        currentDifficulty = settings.difficulty;
        maxMistakes = flowerByDifficulty[currentDifficulty].max;
        currentFlower = flowerByDifficulty[currentDifficulty].emoji;
        
        const flowerImage = document.getElementById('flower-image');
        if(flowerImage) {
            if(mistakes >= getFadingThreshold()) {
                flowerImage.src = flowerByDifficulty[currentDifficulty].fadingImg;
            } else {
                flowerImage.src = flowerByDifficulty[currentDifficulty].img;
            }
        }
        
        const petalsCount = document.getElementById('petals-count');
        if(petalsCount) petalsCount.textContent = `Лепестков: ${maxMistakes - mistakes}`;
    }
}

function getFadingThreshold() {
    switch(currentDifficulty) {
        case 'easy': return 4;
        case 'normal': return 3;
        case 'hard': return 2;
        default: return 3;
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
    perfectGameAchievementGranted = false;
    factShownThisGame = false;
    factButtonEnabled = false;
    updateUI();
    generateKeyboard();
    updateWordDescription();
    updateFactButtonVisibility();
    
    const hintBtn = document.getElementById('hint-button');
    if(hintBtn) {
        hintBtn.disabled = false;
        hintBtn.textContent = `Подсказка (${hintsLeft})`;
    }
    const comboIndicator = document.getElementById('combo-indicator');
    if(comboIndicator) comboIndicator.innerHTML = "";
    
    const flowerImage = document.getElementById('flower-image');
    if(flowerImage) {
        flowerImage.classList.remove('glow');
        flowerImage.src = flowerByDifficulty[currentDifficulty].img;
    }
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
        if(comboIndicator) comboIndicator.innerHTML = "Цветок сияет!";
    } else {
        if(flowerImage) flowerImage.classList.remove('glow');
        if(comboIndicator) comboIndicator.innerHTML = "";
    }
    
    if(flowerImage) {
        if(mistakes >= getFadingThreshold()) {
            flowerImage.src = flowerByDifficulty[currentDifficulty].fadingImg;
        } else {
            flowerImage.src = flowerByDifficulty[currentDifficulty].img;
        }
    }
    
    if(currentWord.split('').every(l => guessedLetters.includes(l))) {
        gameActive = false;
        score += 50;
        updateUI();
        showModal(`🎉 Победа! Вы спасли цветок! +50 очков. Финальный счёт: ${score} 🎉`, true);
        updateAchievements();
        updateFactButtonVisibility();
        return;
    }
    if(mistakes >= maxMistakes) {
        gameActive = false;
        showModal(`💀 Увы... цветок завял. Загаданное слово: ${currentWord}. Счёт: ${score}`, false);
        updateAchievements();
        updateFactButtonVisibility();
        return;
    }
    if(score <= 30) {
        gameActive = false;
        showModal(`⚠️ Недостаточно очков (<=30). Вы проиграли. Слово: ${currentWord}`, false);
        updateAchievements();
        updateFactButtonVisibility();
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
        if (mistakes >= 2 && !factShownThisGame) {
            factShownThisGame = true;
            factButtonEnabled = true;
            updateFactButtonVisibility();
            showFactOnce();
        }
    }
    updateKeyboardUI();
    updateUI();
}

function getCurrentFact() {
    if (currentWordObj && interestingFactsWithoutWord[currentWordObj.word]) {
        return interestingFactsWithoutWord[currentWordObj.word];
    } else if (currentWordObj) {
        return `🌱 Интересный факт: Это растение имеет удивительную историю и связано с миром садоводства! 🌱`;
    }
    return "🌱 Интересный факт: Садоводство — это удивительное занятие, соединяющее человека с природой! 🌱";
}

function showFactOnce() {
    showModal(getCurrentFact(), false, 5000);
}

function showFactOnButtonClick() {
    if (factButtonEnabled && gameActive) {
        showModal(getCurrentFact(), false, 5000);
    }
}

function fetchFactAsync(factText) {
    return new Promise((resolve) => {
        resolve(true);
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
            updateFactButtonVisibility();
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
            hintBtn.textContent = `Подсказка (${hintsLeft})`;
            updateUI();
            showModal(`🌿 Открыта буква "${randomLetter}"!`, false, 1800);
            updateKeyboardUI();
            if(currentWord.split('').every(l => guessedLetters.includes(l))) updateUI();
        }
    });
}

const factBtn = document.getElementById('fact-button');
if(factBtn) {
    factBtn.addEventListener('click', () => {
        showFactOnButtonClick();
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
        comboMaster: false,
        perfectGame: false
    };
    if(score > achieves.maxScore) achieves.maxScore = score;
    if(!gameActive && mistakes >= maxMistakes) achieves.loseCount++;
    if(gameActive === false && currentWord.split('').every(l => guessedLetters.includes(l)) && hintsLeft === 3) achieves.noHintWin = true;
    if(hintsLeft === 0) achieves.allHintsUsed = true;
    if(combo >= 4) achieves.comboMaster = true;
    if(gameActive === false && currentWord.split('').every(l => guessedLetters.includes(l)) && mistakes === 0 && !perfectGameAchievementGranted) {
        achieves.perfectGame = true;
        perfectGameAchievementGranted = true;
    }
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