document.addEventListener("DOMContentLoaded", () => {
    const tg = window.Telegram?.WebApp;
    tg?.expand();

    const user = tg?.initDataUnsafe?.user;
    if (!user) return;

    checkIfNewUser(user);
    updateNavbarProfile(user);
    updateNavbarBalance(user);
});

function checkIfNewUser(user) {
    const userRef = db.collection("users").doc(String(user.id));

    userRef.get().then(doc => {
        if (doc.exists) {
            console.log("Returning user:", doc.data());
        } else {
            console.log("New user detected, creating entry with 100 coins...");
            userRef.set({
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name || '',
                username: user.username || '',
                photo_url: user.photo_url || '',
                coins: 100,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                console.log("New user saved with 100 coins.");
                updateNavbarBalance(user); // Ensure balance shows immediately
            }).catch(err => console.error("Error saving new user:", err));
        }
    }).catch(err => console.error("Error checking user:", err));
}

function updateNavbarProfile(user) {
    const profilePic = document.getElementById("profile-pic");
    if (!profilePic || !user) return;

    profilePic.src = user.photo_url || `https://via.placeholder.com/150/4CAF50/ffffff?text=${encodeURIComponent(user.first_name[0])}`;
}

function updateNavbarBalance(user) {
    const navbarBalanceElem = document.querySelector('.balance');
    if (!navbarBalanceElem || !user) return;

    db.collection("users").doc(String(user.id)).get().then(doc => {
        if (doc.exists) {
            const coins = doc.data().coins || 0;
            navbarBalanceElem.textContent = coins.toFixed(2);
        }
    }).catch(err => console.error("Error fetching navbar balance:", err));
}

function showProfileView() {
    const tg = window.Telegram?.WebApp;
    tg?.expand?.();
    const user = tg?.initDataUnsafe?.user;

    const profileNameElem = document.getElementById('userName');
    const profileImgElem = document.getElementById('profilePic');
    const coinBalanceElem = document.getElementById('coinBalance');
    const navbarBalanceElem = document.querySelector('.balance');

    if (user) {
        const fullName = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        if (profileNameElem) profileNameElem.innerText = fullName;
        if (profileImgElem) {
            profileImgElem.src = user.photo_url || `https://via.placeholder.com/150/4CAF50/ffffff?text=${encodeURIComponent(user.first_name[0])}`;
        }

        db.collection("users").doc(String(user.id)).get().then(doc => {
            if (doc.exists) {
                const coins = doc.data().coins || 0;
                if (coinBalanceElem) coinBalanceElem.textContent = coins;
                if (navbarBalanceElem) navbarBalanceElem.textContent = coins.toFixed(2);
            }
        }).catch(err => console.error("Error fetching user data:", err));
    } else {
        if (profileNameElem) profileNameElem.innerText = 'Guest';
        if (profileImgElem) profileImgElem.src = 'user.png';
        if (coinBalanceElem) coinBalanceElem.textContent = '0';
        if (navbarBalanceElem) navbarBalanceElem.textContent = '0.00';
    }

    document.getElementById('game-list-view').style.display = 'none';
    document.getElementById('game-detail-view').style.display = 'none';
    document.getElementById('flappy-container').style.display = 'none';
    document.getElementById('profile-view').style.display = 'block';
}

// Game Display Logic
const gameData = {
    'Flappy Bird': {
        image: 'Flappy_Bird.png',
        intro: 'Fly the bird between pipes without hitting them!',
        gallery: Array(5).fill('Flappy_Bird.png')
    },
    'Space Invaders': {
        image: 'Flappy_Bird.png',
        intro: 'Defend against waves of alien invaders!',
        gallery: Array(5).fill('Flappy_Bird.png')
    },
    'Snake': {
        image: 'Flappy_Bird.png',
        intro: 'Eat food to grow the snake, but don’t hit yourself!',
        gallery: Array(5).fill('Flappy_Bird.png')
    },
    'Tetris': {
        image: 'Flappy_Bird.png',
        intro: 'Fit falling blocks together to clear lines.',
        gallery: Array(5).fill('Flappy_Bird.png')
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

// Firebase Setup
const firebaseConfig = {
    apiKey: "AIzaSyCU34AXm29TLwmag5hf6hymFztK2ciW2HI",
    authDomain: "arcadium-test-297c0.firebaseapp.com",
    databaseURL: "https://arcadium-test-297c0-default-rtdb.firebaseio.com",
    projectId: "arcadium-test-297c0",
    storageBucket: "arcadium-test-297c0.appspot.com",
    messagingSenderId: "1007954059983",
    appId: "1:1007954059983:web:a1c09597d4cfddf010cdba",
    measurementId: "G-F6C4GLX7Q5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Optional Score Saving
function saveScore(gameName, score) {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!user) {
        console.error("User not authenticated.");
        return;
    }

    const userId = String(user.id);
    const scoresRef = db
        .collection("users").doc(userId)
        .collection("games").doc(gameName)
        .collection("scores");

    scoresRef.add({
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        console.log(`Score of ${score} saved for game ${gameName} under user ${userId}`);
    }).catch(err => {
        console.error("Error saving score:", err);
    });
}


// Optional Logging
function logEventCustom(eventName, details) {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const userId = user?.id || 'Guest';

    db.collection("users").doc(String(userId))
      .collection("logs").add({
          event: eventName,
          details: details,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
          console.log(`Event '${eventName}' logged for user ${userId}`);
      }).catch(err => {
          console.error("Error logging event:", err);
      });
}
