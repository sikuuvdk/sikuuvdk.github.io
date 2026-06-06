const achievementsData = [
    { id: "maxScore", name: "Мастер полива", desc: "Набрать 150+ очков за одну игру", icon: "💧", check: (a) => a.maxScore >= 150 },
    { id: "loseCount", name: "Философ увядания", desc: "Проиграть 3 раза", icon: "🍂", check: (a) => a.loseCount >= 3 },
    { id: "noHintWin", name: "Чистый сад", desc: "Победить без подсказок", icon: "🌱", check: (a) => a.noHintWin === true },
    { id: "allHintsUsed", name: "Любопытный садовник", desc: "Использовать все 3 подсказки за игру", icon: "🔍", check: (a) => a.allHintsUsed === true },
    { id: "comboMaster", name: "Цветочный экстаз", desc: "Сделать комбо из 4+ букв подряд", icon: "✨", check: (a) => a.comboMaster === true }
];
function renderAchievements() {
    const data = JSON.parse(localStorage.getItem('gameAchievements')) || { maxScore:0, loseCount:0, noHintWin:false, allHintsUsed:false, comboMaster:false };
    const container = document.getElementById('achievements-list');
    if(!container) return;
    container.innerHTML = '';
    achievementsData.forEach(ach => {
        const unlocked = ach.check(data);
        const card = document.createElement('div');
        card.className = `achievement-card ${unlocked ? '' : 'locked'}`;
        card.innerHTML = `
            <div class="achievement-icon">${ach.icon}</div>
            <h3>${ach.name}</h3>
            <p>${ach.desc}</p>
            <small>${unlocked ? '✅ Достигнуто' : '🔒 Закрыто'}</small>
        `;
        container.appendChild(card);
    });
}
const toggle = document.getElementById('theme-toggle');
if(toggle) {
    const curr = localStorage.getItem('theme');
    if(curr === 'dark') document.body.classList.add('dark');
    if(curr === 'dark') toggle.checked = true;
    toggle.addEventListener('change', () => {
        if(toggle.checked) { document.body.classList.add('dark'); localStorage.setItem('theme','dark');}
        else { document.body.classList.remove('dark'); localStorage.setItem('theme','light');}
    });
}
renderAchievements();