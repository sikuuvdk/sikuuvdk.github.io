let cwo = null;
let cw = "";
let gl = [];
let err = 0;
let sc = 100;
let hl = 3;
let cb = 0;
let active = true;
let diff = "normal";
let maxErr = 5;
let perfectDone = false;
let factShown = false;
let factEnabled = false;
const flowerByDiff = { 
    easy: { max:7, img:"images/rose.png", fade:"images/rose-fading.png" }, 
    normal: { max:5, img:"images/chamomile.png", fade:"images/chamomile-fading.png" }, 
    hard:{ max:3, img:"images/bell.png", fade:"images/bell-fading.png" } 
};
const desc = {
    "САДОВОД": "Это человек, который помогает растениям расти и плодоносить, ухаживая за ними с весны до осени. Он знает, как правильно обрезать ветки, поливать кусты и бороться с вредителями. Благодаря его труду на участке появляются яблоки, смородина и душистые цветы.",
    "РОМАШКА": "Это полевой цветок с белыми лепестками и жёлтой серединкой. Часто используется в народной медицине и символизирует русскую природу. Его цветы закрываются на ночь, а утром снова раскрываются.",
    "ПОДСОЛНУХ": "Это высокое растение с крупной жёлтой головкой, наполненной семечками. Оно поворачивается вслед за солнцем, но только до момента цветения. Из его семян делают масло и вкусные козинаки.",
    "ОРАНЖЕРЕЯ": "Это стеклянное сооружение для выращивания теплолюбивых растений. Первые такие постройки появились ещё в Древнем Риме. Внутри поддерживается особый микроклимат, позволяющий плодоносить лимонам и апельсинам даже в холодных странах.",
    "ФЛОРАРИУМ": "Это миниатюрный сад в стеклянной ёмкости, который поливают всего раз в несколько месяцев. Внутри создаётся замкнутая экосистема, где растения живут в собственном маленьком мире."
};
const factsWo = {
    "САДОВОД": "Факт: эта профессия существует более 10 000 лет!",
    "РОМАШКА": "Факт: цветок закрывает лепестки на ночь!",
    "ПОДСОЛНУХ": "Факт: поворачивается вслед за солнцем!",
    "ОРАНЖЕРЕЯ": "Факт: появились в Древнем Риме!",
    "ФЛОРАРИУМ": "Факт: поливают раз в несколько месяцев!"
};
function showToast(msg, type = 'info') {
    let toast = document.getElementById('game-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'game-toast';
        toast.className = 'game-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = `game-toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}
function updateDesc() {
    const el = document.getElementById('desc-placeholder');
    if (!el) return;
    el.textContent = cwo && desc[cwo.w] ? desc[cwo.w] : "Это слово о растениях и садоводстве";
}
function toggleFactBtn() {
    const btn = document.getElementById('fact-button');
    if (btn) btn.classList.toggle('fact-btn-hidden', !(factEnabled && active));
}
function loadSet() {
    const s = JSON.parse(localStorage.getItem('gameSettings'));
    if(s) {
        diff = s.difficulty;
        maxErr = flowerByDiff[diff].max;
        const img = document.getElementById('flower-image');
        if(img) img.src = err >= getFadeThresh() ? flowerByDiff[diff].fade : flowerByDiff[diff].img;
        const p = document.getElementById('petals-count');
        if(p) p.textContent = `Лепестков: ${maxErr - err}`;
    }
}
function getFadeThresh() {
    return diff == 'easy' ? 4 : diff == 'normal' ? 3 : 2;
}
function init() {
    cwo = getWord();
    cw = cwo.w.toUpperCase();
    gl = [];
    err = 0;
    sc = 100;
    hl = 3;
    cb = 0;
    active = true;
    perfectDone = false;
    factShown = false;
    factEnabled = false;
    updateUI();
    genKbd();
    updateDesc();
    toggleFactBtn();
    const hint = document.getElementById('hint-button');
    if(hint) {
        hint.disabled = false;
        hint.textContent = `Подсказка (${hl})`;
    }
    const ci = document.getElementById('combo-indicator');
    if(ci) ci.innerHTML = "";
    const img = document.getElementById('flower-image');
    if(img) {
        img.classList.remove('glow');
        img.src = flowerByDiff[diff].img;
    }
    document.querySelectorAll('.falling-petal').forEach(p => p.remove());
}
function updateUI() {
    if(!active) return;
    const masked = cw.split('').map(l => gl.includes(l) ? l : '_').join(' ');
    const wm = document.getElementById('word-mask');
    if(wm) wm.innerHTML = masked;
    document.getElementById('score') && (document.getElementById('score').textContent = sc);
    document.getElementById('mistakes') && (document.getElementById('mistakes').textContent = err);
    document.getElementById('petals-count') && (document.getElementById('petals-count').textContent = `Лепестков: ${maxErr - err}`);
    document.getElementById('combo') && (document.getElementById('combo').textContent = cb);
    const img = document.getElementById('flower-image');
    const ci = document.getElementById('combo-indicator');
    if(cb >= 2) {
        img && img.classList.add('glow');
        ci && (ci.innerHTML = "Цветок сияет!");
    } else {
        img && img.classList.remove('glow');
        ci && (ci.innerHTML = "");
    }
    if(img) img.src = err >= getFadeThresh() ? flowerByDiff[diff].fade : flowerByDiff[diff].img;
    if(cw.split('').every(l => gl.includes(l))) {
        active = false;
        sc += 50;
        updateUI();
        showToast(`Победа! +50 очков. Счёт: ${sc}`, 'win');
        updateAch();
        toggleFactBtn();
        return;
    }
    if(err >= maxErr) {
        active = false;
        showToast(`💀 Цветок завял. Слово: ${cw}. Счёт: ${sc}`, 'lose');
        updateAch();
        toggleFactBtn();
        return;
    }
    if(sc <= 30) {
        active = false;
        showToast(`Очков <=30. Проигрыш. Слово: ${cw}`, 'lose');
        updateAch();
        toggleFactBtn();
    }
}
function guess(l) {
    if(!active || gl.includes(l)) return;
    gl.push(l);
    const ok = cw.includes(l);
    if(ok) {
        sc += 10;
        cb++;
        updateUI();
        const key = document.querySelector(`.key[data-letter='${l}']`);
        if(key) {
            key.style.background = "var(--correct-color)";
            setTimeout(() => { if(key) key.style.background = ""; }, 300);
        }
    } else {
        err++;
        sc = Math.max(0, sc - 5);
        cb = 0;
        updateUI();
        const img = document.getElementById('flower-image');
        if(img) {
            img.style.transform = "rotate(5deg)";
            setTimeout(() => { if(img) img.style.transform = ""; }, 200);
        }
        if(err >= 2 && !factShown) {
            factShown = true;
            factEnabled = true;
            toggleFactBtn();
            showToast(getCurFact(), 'fact');
        }
        setTimeout(() => dropPetal(), 10);
    }
    updateKbdUI();
    updateUI();
}
function getCurFact() {
    return cwo && factsWo[cwo.w] ? factsWo[cwo.w] : "Садоводство — это удивительное занятие!";
}
function onFactClick() {
    if(factEnabled && active) showToast(getCurFact(), 'fact');
}
function updateKbdUI() {
    document.querySelectorAll('.key').forEach(key => {
        const l = key.getAttribute('data-letter');
        if(gl.includes(l)) key.classList.add('used');
    });
}
function genKbd() {
    const letters = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split('');
    const kb = document.getElementById('keyboard');
    if(!kb) return;
    kb.innerHTML = '';
    letters.forEach(l => {
        const btn = document.createElement('div');
        btn.className = 'key';
        btn.textContent = l;
        btn.setAttribute('data-letter', l);
        btn.onclick = () => guess(l);
        kb.appendChild(btn);
    });
}
function updateAch() {
    let a = JSON.parse(localStorage.getItem('gameAchievements')) || {
        maxScore: 0, loseCount: 0, noHintWin: false, allHintsUsed: false, comboMaster: false, perfectGame: false
    };
    if(sc > a.maxScore) a.maxScore = sc;
    if(!active && err >= maxErr) a.loseCount++;
    if(!active && cw.split('').every(l => gl.includes(l)) && hl === 3) a.noHintWin = true;
    if(hl === 0) a.allHintsUsed = true;
    if(cb >= 4) a.comboMaster = true;
    if(!active && cw.split('').every(l => gl.includes(l)) && err === 0 && !perfectDone) {
        a.perfectGame = true;
        perfectDone = true;
    }
    localStorage.setItem('gameAchievements', JSON.stringify(a));
}
function getPetalImg() {
    const s = JSON.parse(localStorage.getItem('gameSettings'));
    if(s) {
        switch(s.difficulty) {
            case 'easy': return 'images/rose-petal.png';
            case 'normal': return 'images/chamomile-petal.png';
            case 'hard': return 'images/bell-petal.png';
        }
    }
    return 'images/chamomile-petal.png';
}
function dropPetal() {
    const img = getPetalImg();
    const petal = document.createElement('img');
    petal.src = img;
    petal.className = 'falling-petal';
    const area = document.getElementById('flower-area');
    const flower = document.getElementById('flower-image');
    if(flower) {
        const rect = flower.getBoundingClientRect();
        const areaRect = area.getBoundingClientRect();
        petal.style.left = (rect.left - areaRect.left + Math.random() * rect.width) + 'px';
        petal.style.top = (rect.top - areaRect.top + 10) + 'px';
    } else {
        petal.style.left = Math.random() * (area.clientWidth - 30) + 'px';
        petal.style.top = '50px';
    }
    petal.style.transform = `rotate(${Math.random() * 360}deg)`;
    area.appendChild(petal);
    setTimeout(() => petal.remove(), 2000);
}
function updateFlowerImg() {
    const s = JSON.parse(localStorage.getItem('gameSettings'));
    const img = document.getElementById('flower-image');
    if(!img) return;
    let name = 'images/chamomile.png';
    if(s) {
        switch(s.difficulty) {
            case 'easy': name = 'images/rose.png'; break;
            case 'hard': name = 'images/bell.png'; break;
            default: name = 'images/chamomile.png';
        }
    }
    img.src = name;
}
(function() {
    const a = new Audio('audio/game.mp3');
    a.loop = true;
    const toggle = document.getElementById('music-toggle');
    const slider = document.getElementById('volume-slider');
    const valSpan = document.getElementById('volume-value');
    if(toggle && slider) {
        let playing = false;
        let vol = localStorage.getItem('game_music_volume');
        a.volume = vol ? vol / 100 : 0.5;
        if(slider) slider.value = vol || 50;
        if(valSpan) valSpan.textContent = (vol || 50) + '%';
        toggle.checked = false;
        toggle.onclick = () => {
            if(toggle.checked) {
                a.play().then(() => {
                    playing = true;
                }).catch(() => {
                    playing = false;
                    toggle.checked = false;
                    showToast("🔊 Нажмите на страницу для включения музыки", 'info');
                });
            } else {
                a.pause();
                playing = false;
            }
        };
        slider.oninput = (e) => {
            const v = parseInt(e.target.value);
            a.volume = v / 100;
            if(valSpan) valSpan.textContent = v + '%';
            localStorage.setItem('game_music_volume', v);
        };
    }
})();
const themeToggle = document.getElementById('theme-toggle');
const curTheme = localStorage.getItem('theme') || 'light';
if(curTheme === 'dark') document.body.classList.add('dark');
if(themeToggle) {
    themeToggle.checked = curTheme === 'dark';
    themeToggle.addEventListener('change', () => {
        if(themeToggle.checked) {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    });
}
document.getElementById('guess-word-btn')?.addEventListener('click', () => {
    if(!active) return;
    const w = prompt("Введите слово (заглавными):");
    if(w && w.toUpperCase() === cw) {
        sc += 50;
        updateUI();
        showToast(`Верно! +50 очков! Слово: ${cw}`, 'win');
        active = false;
        updateUI();
        updateAch();
        toggleFactBtn();
    } else if(w) {
        err++;
        sc = Math.max(0, sc - 10);
        updateUI();
        showToast(` Неверно! "${w}" -10 очков.`, 'error');
        if(err >= maxErr) updateUI();
    }
});
document.getElementById('hint-button')?.addEventListener('click', () => {
    if(!active) return;
    if(hl <= 0) { 
        showToast(" Нет подсказок!", 'error');
        return; 
    }
    const unguessed = cw.split('').filter(l => !gl.includes(l));
    if(unguessed.length === 0) return;
    const l = unguessed[Math.floor(Math.random() * unguessed.length)];
    if(!gl.includes(l)) {
        gl.push(l);
        hl--;
        document.getElementById('hint-button').textContent = `Подсказка (${hl})`;
        updateUI();
        showToast(` Буква "${l}" открыта!`, 'info');
        updateKbdUI();
        if(cw.split('').every(l => gl.includes(l))) updateUI();
    }
});
document.getElementById('fact-button')?.addEventListener('click', onFactClick);
document.getElementById('reset-game-btn')?.addEventListener('click', () => {
    init();
    setTimeout(() => {
        updateFlowerImg();
        document.getElementById('flower-image')?.classList.remove('glow');
        document.querySelectorAll('.falling-petal').forEach(p => p.remove());
    }, 10);
});
setTimeout(() => {
    updateFlowerImg();
    setInterval(() => {
        const cv = parseInt(document.getElementById('combo')?.textContent || '0');
        const img = document.getElementById('flower-image');
        const ci = document.getElementById('combo-indicator');
        if(img) {
            if(cv >= 2) {
                img.classList.add('glow');
                if(ci) ci.innerHTML = "✨ Цветок сияет! ✨";
            } else {
                img.classList.remove('glow');
                if(ci && cv < 2) ci.innerHTML = "";
            }
        }
    }, 100);
}, 50);
window.guess = guess;
window.init = init;
window.loadSet = loadSet;
window.updateUI = updateUI;
loadSet();
init();