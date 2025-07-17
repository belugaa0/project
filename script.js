document.addEventListener("DOMContentLoaded", function () {
    const tg = window.Telegram?.WebApp;
    tg?.expand();

    const user = tg?.initDataUnsafe?.user;
    updateNavbarProfile(user);
});

function updateNavbarProfile(user) {
    const profilePic = document.getElementById("profile-pic");

    if (user) {
        profilePic.src = user.photo_url || `https://via.placeholder.com/150/4CAF50/ffffff?text=${encodeURIComponent(user.first_name[0])}`;
    } else {
        profilePic.src = 'user.png';
    }
}


const gameData = {
    'Flappy Bird': {
        image: 'Flappy_Bird.png',
        intro: 'Fly the bird between pipes without hitting them!',
        gallery: ['Flappy_Bird.png','Flappy_Bird.png','Flappy_Bird.png','Flappy_Bird.png','Flappy_Bird.png']
    },
    'Space Invaders': {
        image: 'Flappy_Bird.png',
        intro: 'Defend against waves of alien invaders!',
        gallery:  ['Flappy_Bird.png','Flappy_Bird.png','Flappy_Bird.png','Flappy_Bird.png','Flappy_Bird.png']
    },
    'Snake': {
        image: 'Flappy_Bird.png',
        intro: 'Eat food to grow the snake, but don’t hit yourself!',
        gallery:  ['Flappy_Bird.png','Flappy_Bird.png','Flappy_Bird.png','Flappy_Bird.png','Flappy_Bird.png']
    },
    'Tetris': {
        image: 'Flappy_Bird.png',
        intro: 'Fit falling blocks together to clear lines.',
        gallery:  ['Flappy_Bird.png','Flappy_Bird.png','Flappy_Bird.png','Flappy_Bird.png','Flappy_Bird.png']
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
        imgEl.alt = `${gameName} screenshot`;
        imgEl.className = 'gallery-img';
        gallery.appendChild(imgEl);
    });

    document.getElementById('game-list-view').style.display = 'none';
    document.getElementById('game-detail-view').style.display = 'flex';
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('flappy-container').style.display = 'none';
}

function showGameList() {
    document.getElementById('game-list-view').style.display = 'grid';
    document.getElementById('game-detail-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('flappy-container').style.display = 'none';
}

function playGame() {
    const selectedGame = document.getElementById('game-detail-title').textContent;
    if (selectedGame === 'Flappy Bird') {
        launchFlappyArcadium();
    } else {
        alert('Launching ' + selectedGame + '... (Coming Soon)');
    }
}

function launchFlappyArcadium() {
    document.getElementById('game-list-view').style.display = 'none';
    document.getElementById('game-detail-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'none';

    const frameContainer = document.getElementById('flappy-container');
    frameContainer.innerHTML = `
        <iframe id="flappy-frame" src="flappy.html" style="width:100%; height:80vh; border:none;"></iframe>
        <div style="margin-top:10px; text-align:center;">
            <button onclick="retryFlappy()">Retry</button>
            <button onclick="backToDetail()">Back</button>
        </div>
    `;
    frameContainer.style.display = 'block';
}

function retryFlappy() {
    const frame = document.getElementById('flappy-frame');
    frame.src = frame.src;
}

function backToDetail() {
    document.getElementById('flappy-container').style.display = 'none';
    showGameDetail('Flappy Bird');
}

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
            profileImgElem.src = user.photo_url;
        } else {
            profileImgElem.src = `https://via.placeholder.com/150/4CAF50/ffffff?text=${encodeURIComponent(user.first_name[0])}`;
        }
    } else {
        profileNameElem.innerText = 'Guest';
        profileImgElem.src = 'user.png';
    }

    document.getElementById('game-list-view').style.display = 'none';
    document.getElementById('game-detail-view').style.display = 'none';
    document.getElementById('flappy-container').style.display = 'none';
    document.getElementById('profile-view').style.display = 'block';
}

/* ====== Firebase Initialization (No imports required because SDK is loaded via HTML) ====== */
const firebaseConfig = {
    apiKey: "AIzaSyCU34AXm29TLwmag5hf6hymFztK2ciW2HI",
    authDomain: "arcadium-test-297c0.firebaseapp.com",
    databaseURL: "https://arcadium-test-297c0-default-rtdb.firebaseio.com",
    projectId: "arcadium-test-297c0",
    storageBucket: "arcadium-test-297c0.firebasestorage.app",
    messagingSenderId: "1007954059983",
    appId: "1:1007954059983:web:a1c09597d4cfddf010cdba",
    measurementId: "G-F6C4GLX7Q5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function saveScore(gameName, score) {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const userId = user?.id || 'Guest';

    db.collection("scores").add({
        userId: userId,
        game: gameName,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        console.log("Score saved to Firebase!");
    }).catch(err => {
        console.error("Error saving score:", err);
    });
}

function logEventCustom(eventName, details) {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const userId = user?.id || 'Guest';

    db.collection("logs").add({
        userId: userId,
        event: eventName,
        details: details,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        console.log("Event logged to Firebase!");
    }).catch(err => {
        console.error("Error logging event:", err);
    });
}
