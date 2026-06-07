const achList = [
    { id: "maxScore", name: "Мастер полива", desc: "Набрать 150+ очков", icon: "💧", check: (d) => d.maxScore >= 150 },
    { id: "loseCount", name: "Философ увядания", desc: "Проиграть 3 раза", icon: "🍂", check: (d) => d.loseCount >= 3 },
    { id: "noHintWin", name: "Чистый сад", desc: "Победить без подсказок", icon: "🌱", check: (d) => d.noHintWin === true },
    { id: "allHintsUsed", name: "Любопытный садовник", desc: "Использовать 3 подсказки", icon: "🔍", check: (d) => d.allHintsUsed === true },
    { id: "comboMaster", name: "Цветочный экстаз", desc: "Комбо из 4+ букв", icon: "✨", check: (d) => d.comboMaster === true },
    { id: "perfectGame", name: "Идеальный сад", desc: "Победить без ошибок", icon: "🏆", check: (d) => d.perfectGame === true }
];
function renderAch() {
    const data = JSON.parse(localStorage.getItem('gameAchievements')) || { maxScore:0, loseCount:0, noHintWin:false, allHintsUsed:false, comboMaster:false, perfectGame:false };
    const cont = document.getElementById('achievements-list');
    if(!cont) return;
    cont.innerHTML = '';
    achList.forEach(a => {
        const ok = a.check(data);
        const card = document.createElement('div');
        card.className = `achievement-card ${ok ? '' : 'locked'}`;
        card.innerHTML = `<div class="achievement-icon">${a.icon}</div><h3>${a.name}</h3><p>${a.desc}</p><small>${ok ? '✅ Достигнуто' : '🔒 Закрыто'}</small>`;
        cont.appendChild(card);
    });
}
(function() {
    const a = new Audio('audio/achievements.mp3');
    a.loop = true;
    const toggle = document.getElementById('music-toggle');
    const slider = document.getElementById('volume-slider');
    const valSpan = document.getElementById('volume-value');
    let vol = localStorage.getItem('achievements_music_volume');
    if(vol !== null) {
        a.volume = vol / 100;
        slider.value = vol;
        valSpan.textContent = vol + '%';
    } else {
        a.volume = 0.5;
        slider.value = 50;
        valSpan.textContent = '50%';
    }
    toggle.checked = false;
    const playMusic = () => {
        a.play().then(() => {}).catch(() => {
            toggle.checked = false;
        });
    };
    const stopMusic = () => {
        a.pause();
    };
    if(toggle) toggle.onchange = () => toggle.checked ? playMusic() : stopMusic();
    if(slider) slider.oninput = (e) => {
        const v = parseInt(e.target.value);
        a.volume = v / 100;
        valSpan.textContent = v + '%';
        localStorage.setItem('achievements_music_volume', v);
    };
})();
const themeToggle = document.getElementById('theme-toggle');
if(themeToggle) {
    const cur = localStorage.getItem('theme');
    if(cur === 'dark') document.body.classList.add('dark');
    themeToggle.checked = cur === 'dark';
    themeToggle.onchange = () => {
        if(themeToggle.checked) {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };
}
renderAch();