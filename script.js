document.addEventListener("DOMContentLoaded", () => {
    const tg = window.Telegram?.WebApp;
    tg?.expand();

    const user = tg?.initDataUnsafe?.user;
    if (!user) return;

    checkIfNewUser(user);
    updateNavbarProfile(user);
    updateNavbarBalance(user);
    setupWalletButton(user); // ✅ Required for wallet connect to work
});


// ================= USER PROFILE ===================
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
                updateNavbarBalance(user);
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

    setupWalletButton(user); // 👈 Connect wallet when profile is shown

}

// ================= GAME DISPLAY ===================
const gameData = {
    'Flappy Bird': {
        image: 'Flappy_Bird.png',
        intro: 'Fly the bird between pipes without hitting them!',
        gallery: Array(5).fill('Flappy_Bird.png')
    },
    'Tic Tac Toe': {
        image: 'tic_tac_toe.png',
        intro: 'Outsmart the AI in this classic strategy game!',
        gallery: Array(5).fill('tic_tac_toe.png')
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

// ================= GAME PLAY ===================
function playGame() {
    const selectedGame = document.getElementById('game-detail-title').textContent;
    if (selectedGame === 'Flappy Bird') {
        launchFlappyArcadium();
    } else if (selectedGame === 'Tic Tac Toe') {
        launchTicTacToe();
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
            <button onclick="backToDetail('Flappy Bird')">Back</button>
        </div>
    `;
    frameContainer.style.display = 'block';
}

function launchTicTacToe() {
    document.getElementById('game-list-view').style.display = 'none';
    document.getElementById('game-detail-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'none';

    const frameContainer = document.getElementById('flappy-container');
    frameContainer.innerHTML = `
        <iframe id="tictactoe-frame" src="tictactoe.html" style="width:100%; height:80vh; border:none;"></iframe>
        <div style="margin-top:10px; text-align:center;">
            <button onclick="retryTicTacToe()">Retry</button>
            <button onclick="backToDetail('Tic Tac Toe')">Back</button>
        </div>
    `;
    frameContainer.style.display = 'block';
}

function retryFlappy() {
    const frame = document.getElementById('flappy-frame');
    frame.src = frame.src;
}

function retryTicTacToe() {
    const frame = document.getElementById('tictactoe-frame');
    frame.src = frame.src;
}

function backToDetail(gameName = 'Flappy Bird') {
    document.getElementById('flappy-container').style.display = 'none';
    showGameDetail(gameName);
}

// ================= FIREBASE ===================
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

        // Reward system
        let reward = 0;
        if (gameName === "Flappy Bird") {
            reward = score * 0.25;
        } else if (gameName === "Tic Tac Toe" && score === 1) {
            reward = 0.75; // Only reward on human win
        }

        if (reward > 0) {
            const userRef = db.collection("users").doc(userId);
            userRef.get().then(doc => {
                if (doc.exists) {
                    const oldCoins = doc.data().coins || 0;
                    const newCoins = oldCoins + reward;

                    userRef.update({ coins: newCoins }).then(() => {
                        console.log(`User rewarded with ${reward} coins. New balance: ${newCoins}`);
                        updateNavbarBalance(user); // refresh displayed balance
                    });
                }
            });
        }

    }).catch(err => {
        console.error("Error saving score:", err);
    });
}


function logEventCustom(eventName, details) {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const userId = user?.id || 'Guest';

  const safeDetails = JSON.parse(JSON.stringify(details));

  db.collection("users").doc(String(userId))
    .collection("logs").add({
      event: eventName,
      details: safeDetails,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      console.log(`Event '${eventName}' logged for user ${userId}`);
    }).catch(err => {
      console.error("Error logging event:", err);
    });
}

// =============== TON CONNECT SETUP ================
let tonConnectUI;

function setupWalletButton(user) {
  const walletBtn = document.querySelector(".walletBtn");
  if (!walletBtn || tonConnectUI) return;

  tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: "https://belugaa0.github.io/project/tonconnect-manifest.json"
  });

  async function updateButtonUI() {
    const wallet = tonConnectUI.connected;
    if (wallet?.account?.address) {
      const walletAddress = wallet.account.address;
      walletBtn.textContent = `Disconnect (${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)})`;

      // Save to Firestore
      if (user) {
        const userRef = db.collection("users").doc(String(user.id));
        await userRef.set({ walletAddress }, { merge: true });

        // Fetch and display balance
        const balance = await fetchTonBalance(walletAddress);
        if (!isNaN(balance)) {
          await userRef.set({ ton: balance }, { merge: true });
          const tonElem = document.getElementById("tonBalance");
          if (tonElem) tonElem.textContent = balance;
        }
      }
    } else {
      walletBtn.textContent = "Connect to Wallet";
      const tonElem = document.getElementById("tonBalance");
      if (tonElem) tonElem.textContent = "0";
    }
  }

  walletBtn.addEventListener("click", async () => {
    const isConnected = !!tonConnectUI.connected?.account?.address;
    if (isConnected) {
      tonConnectUI.disconnect();
    } else {
      try {
        await tonConnectUI.connectWallet();
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    }

    await updateButtonUI();
  });

  // Call on load
  updateButtonUI();
}

async function fetchTonBalance(walletAddress) {
  try {
    const res = await fetch(`https://tonapi.io/v2/accounts/${walletAddress}`);
    const data = await res.json();
    return (data.balance || 0) / 1e9; // Convert from nanoTON
  } catch (e) {
    console.error("Failed to fetch TON balance:", e);
    return 0;
  }
}


// ================= FLAPPY BIRD SCORE REWARD ===================
window.addEventListener("message", async (event) => {
    const { type, score } = event.data;
    if (type === "flappyScore") {
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user) return;

        const userId = String(user.id);
        const userRef = db.collection("users").doc(userId);
        const scoresRef = userRef.collection("games").doc("Flappy Bird").collection("scores");

        // Save the score
        await scoresRef.add({
            score: score,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("Saved Flappy Bird score:", score);

        // Reward: 0.25 coins per score point
        const earnedCoins = parseFloat((score * 0.25).toFixed(2));
        if (earnedCoins > 0) {
            await db.runTransaction(async (tx) => {
                const userSnap = await tx.get(userRef);
                if (!userSnap.exists) return;

                const prev = userSnap.data().coins || 0;
                const newTotal = parseFloat((prev + earnedCoins).toFixed(2));
                tx.update(userRef, { coins: newTotal });
            });

            console.log(`+${earnedCoins} coins rewarded`);

            // Refresh balance in navbar and profile view
            updateNavbarBalance(user);
            const profileCoins = document.getElementById("coinBalance");
            if (profileCoins) {
                const newVal = parseFloat(profileCoins.textContent || "0") + earnedCoins;
                profileCoins.textContent = newVal.toFixed(2);
            }
        }
    }
});
