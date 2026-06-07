const aud = new Audio('audio/start.mp3');
aud.loop = true;
const toggle = document.getElementById('music-toggle');
const slider = document.getElementById('volume-slider');
const valSpan = document.getElementById('volume-value');
let vol = localStorage.getItem('index_music_volume');
if(vol !== null) {
    aud.volume = vol / 100;
    slider.value = vol;
    valSpan.textContent = vol + '%';
} else {
    aud.volume = 0.5;
    slider.value = 50;
    valSpan.textContent = '50%';
}
toggle.checked = false;
function playMusic() {
    aud.play().then(() => {}).catch(e => {
        toggle.checked = false;
    });
}
function stopMusic() {
    aud.pause();
}
toggle.onchange = () => {
    if(toggle.checked) {
        playMusic();
    } else {
        stopMusic();
    }
};
slider.oninput = (e) => {
    const v = parseInt(e.target.value);
    aud.volume = v / 100;
    valSpan.textContent = v + '%';
    localStorage.setItem('index_music_volume', v);
};
document.getElementById('start-game-btn').onclick = () => {
    localStorage.setItem('gameSettings', JSON.stringify({ difficulty: document.getElementById('difficulty').value }));
    location.href = 'game.html';
};
const themeToggle = document.getElementById('theme-toggle');
const curTheme = localStorage.getItem('theme') || 'light';
if(curTheme === 'dark') document.body.classList.add('dark');
if(themeToggle) themeToggle.checked = curTheme === 'dark';
themeToggle.onchange = () => {
    if(themeToggle.checked) {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
};