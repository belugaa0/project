document.addEventListener("DOMContentLoaded", function () {
    const tg = window.Telegram?.WebApp;
    tg?.expand();

    const user = tg?.initDataUnsafe?.user;
    updateNavbarProfile(user);
});

// Update navbar profile info
function updateNavbarProfile(user) {
    const usernameElem = document.getElementById("username");
    const profilePic = document.getElementById("profile-pic");

    if (user) {
        const fullName = user.first_name + (user.last_name ? " " + user.last_name : "");
        if (usernameElem) usernameElem.innerText = fullName;

        if (user.photo_url) {
            if (profilePic) profilePic.src = user.photo_url;
        } else if (profilePic) {
            profilePic.src = "https://via.placeholder.com/150/4CAF50/ffffff?text=" + encodeURIComponent(user.first_name[0]);
        }
    } else if (usernameElem) {
        usernameElem.innerText = "Guest";
    }
}

// Game data
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

// Show game details
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
        imgEl.alt = `${gameName} screenshot`;
        imgEl.className = 'gallery-img';
        gallery.appendChild(imgEl);
    });

    document.getElementById('game-list-view').style.display = 'none';
    document.getElementById('game-detail-view').style.display = 'flex';
    document.getElementById('profile-view').style.display = 'none';
}

// Return to game list
function showGameList() {
    document.getElementById('game-list-view').style.display = 'grid';
    document.getElementById('game-detail-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'none';
}

// Play game (dummy function)
function playGame() {
    alert('Launching game...');
}

// Show profile view and populate Telegram user info
function showProfileView() {
    const tg = window.Telegram?.WebApp;
    tg?.expand?.();
    const user = tg?.initDataUnsafe?.user;

    const profileNameElem = document.getElementById('userName');
    const profileImgElem = document.getElementById('profilePic');

    if (user) {
        const fullName = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        if (profileNameElem) profileNameElem.innerText = fullName;

        if (user.photo_url) {
            if (profileImgElem) profileImgElem.src = user.photo_url;
        } else if (profileImgElem) {
            profileImgElem.src = `https://via.placeholder.com/150/4CAF50/ffffff?text=${encodeURIComponent(user.first_name[0])}`;
        }
    } else {
        if (profileNameElem) profileNameElem.innerText = 'Guest';
        if (profileImgElem) profileImgElem.src = 'user.png';
    }

    document.getElementById('game-list-view').style.display = 'none';
    document.getElementById('game-detail-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'block';
}
