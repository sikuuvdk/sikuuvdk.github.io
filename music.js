// ========== music.js - Управление музыкой для всех страниц ==========

// Хранилище для активной музыки на каждой странице
window.activeMusic = null;
window.musicInitialized = false;

function initPageMusic(musicFile, storageKey) {
    // Останавливаем предыдущую музыку, если она есть
    if (window.activeMusic) {
        window.activeMusic.pause();
        window.activeMusic = null;
    }
    
    // Создаём новый audio элемент
    const audio = new Audio(musicFile);
    audio.loop = false;
    
    let isMusicPlaying = false;
    let currentVolume = 0.5;
    
    // Загружаем сохранённую громкость
    const savedVolume = localStorage.getItem(storageKey + '_volume');
    if (savedVolume) {
        currentVolume = savedVolume / 100;
        audio.volume = currentVolume;
    } else {
        audio.volume = 0.5;
    }
    
    // Когда музыка закончилась
    audio.addEventListener('ended', function() {
        isMusicPlaying = false;
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle) musicToggle.checked = false;
        localStorage.setItem(storageKey + '_playing', 'false');
    });
    
    // Функции управления
    function startMusic() {
        if (audio.ended) {
            audio.currentTime = 0;
        }
        audio.play().then(() => {
            isMusicPlaying = true;
            localStorage.setItem(storageKey + '_playing', 'true');
        }).catch(e => {
            console.log('Play blocked:', e);
            // Пробуем снова при следующем клике
            isMusicPlaying = false;
            localStorage.setItem(storageKey + '_playing', 'false');
        });
    }
    
    function pauseMusic() {
        audio.pause();
        isMusicPlaying = false;
        localStorage.setItem(storageKey + '_playing', 'false');
    }
    
    function setVolume(value) {
        currentVolume = value / 100;
        audio.volume = currentVolume;
        localStorage.setItem(storageKey + '_volume', value);
    }
    
    // Сохраняем ссылку на глобальный объект
    window.activeMusic = audio;
    
    // Настройка UI
    const musicToggle = document.getElementById('music-toggle');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    
    if (musicToggle && volumeSlider) {
        // Загружаем сохранённое состояние
        const savedState = localStorage.getItem(storageKey + '_playing');
        
        // Устанавливаем значения UI
        volumeSlider.value = currentVolume * 100;
        if (volumeValue) volumeValue.textContent = Math.round(currentVolume * 100) + '%';
        
        if (savedState === 'true') {
            musicToggle.checked = true;
            // Не запускаем автоматически - ждём клика пользователя
            // Браузеры блокируют авто-воспроизведение
        } else {
            musicToggle.checked = false;
        }
        
        // Обработчики событий
        musicToggle.onchange = function() {
            if (musicToggle.checked) {
                startMusic();
            } else {
                pauseMusic();
            }
        };
        
        volumeSlider.oninput = function(e) {
            const val = e.target.value;
            if (volumeValue) volumeValue.textContent = val + '%';
            setVolume(val);
        };
    }
    
    // Активация звука по первому клику на странице
    let audioActivated = false;
    
    function activateAudioOnClick() {
        if (audioActivated) return;
        
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle && musicToggle.checked) {
            startMusic();
        }
        
        audioActivated = true;
        document.removeEventListener('click', activateAudioOnClick);
        document.removeEventListener('keydown', activateAudioOnClick);
    }
    
    // Добавляем слушатели только если музыка включена в настройках
    const savedState = localStorage.getItem(storageKey + '_playing');
    if (savedState === 'true') {
        document.addEventListener('click', activateAudioOnClick);
        document.addEventListener('keydown', activateAudioOnClick);
    }
    
    // Возвращаем API для внешнего использования
    return {
        play: startMusic,
        pause: pauseMusic,
        setVolume: setVolume,
        isPlaying: () => isMusicPlaying
    };
}