const gameData = {
    'Flappy Bird': {
        image: 'Flappy_Bird.png',
        intro: 'Fly the bird between pipes without hitting them!',
        gallery: ['Flappy_Bird.png', 'Flappy_Bird.png', 'Flappy_Bird.png', 'Flappy_Bird.png', 'Flappy_Bird.png']
    },
    'Space Invaders': {
        image: 'Flappy_Bird.png',
        intro: 'Defend against waves of alien invaders!',
        gallery: ['Flappy_Bird.png', 'Flappy_Bird.png', 'Flappy_Bird.png', 'Flappy_Bird.png', 'Flappy_Bird.png']
    },
    'Snake': {
        image: 'Flappy_Bird.png',
        intro: 'Eat food to grow the snake, but don’t hit yourself!',
        gallery: ['Flappy_Bird.png', 'Flappy_Bird.png', 'Flappy_Bird.png', 'Flappy_Bird.png', 'Flappy_Bird.png']
    },
    'Tetris': {
        image: 'Flappy_Bird.png',
        intro: 'Fit falling blocks together to clear lines.',
        gallery: ['Flappy_Bird.png', 'Flappy_Bird.png', 'Flappy_Bird.png', 'Flappy_Bird.png', 'Flappy_Bird.png']
    }
};

function showGameDetail(gameName) {
    const data = gameData[gameName];
    if (!data) return;

    document.getElementById('game-detail-img').src = data.image;
    document.getElementById('game-detail-title').textContent = gameName;
    document.getElementById('game-detail-intro').textContent = data.intro;

    const gallery = document.getElementById('game-detail-gallery');
    gallery.innerHTML = '';
    data.gallery.forEach(img => {
        const imgEl = document.createElement('img');
        imgEl.src = img;
        imgEl.className = 'gallery-img';
        imgEl.height = 125;
        gallery.appendChild(imgEl);
    });

    document.getElementById('game-list-view').style.display = 'none';
    document.getElementById('game-detail-view').style.display = 'flex';
}

function showGameList() {
    document.getElementById('game-list-view').style.display = 'grid';
    document.getElementById('game-detail-view').style.display = 'none';
}

function playGame() {
    alert('Launching game...'); 
    // Replace with actual game loading mechanism
}
