document.addEventListener("DOMContentLoaded", () => {
  // Force clear TON Connect cache on load (optional)
  if (window.Telegram?.WebApp?.initData) {
    localStorage.removeItem("ton-connect-storage"); // <- helps in TWA sessions
  }

  // Your usual init
  const tg = window.Telegram?.WebApp;
  tg?.expand();

  const user = tg?.initDataUnsafe?.user;
  if (!user) return;

  checkIfNewUser(user);
  updateNavbarProfile(user);
  updateNavbarBalance(user);
  setupWalletButton(user);
});

// ================= USER PROFILE ===================
function checkIfNewUser(user) {
  const userRef = db.collection("users").doc(String(user.id));
  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        console.log("Returning user:", doc.data());
      } else {
        console.log("New user detected, creating entry with 100 coins...");
        userRef
          .set({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name || "",
            username: user.username || "",
            photo_url: user.photo_url || "",
            coins: 100,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            console.log("New user saved with 100 coins.");
            updateNavbarBalance(user);
          })
          .catch((err) => console.error("Error saving new user:", err));
      }
    })
    .catch((err) => console.error("Error checking user:", err));
}

function updateNavbarProfile(user) {
  const profilePic = document.getElementById("profile-pic");
  if (!profilePic || !user) return;
  profilePic.src =
    user.photo_url ||
    `https://via.placeholder.com/150/4CAF50/ffffff?text=${encodeURIComponent(
      user.first_name[0]
    )}`;
}

function updateNavbarBalance(user) {
  const navbarBalanceElem = document.querySelector(".balance");
  if (!navbarBalanceElem || !user) return;

  db.collection("users")
    .doc(String(user.id))
    .get()
    .then((doc) => {
      if (doc.exists) {
        const coins = doc.data().coins || 0;
        navbarBalanceElem.textContent = coins.toFixed(2);
      }
    })
    .catch((err) => console.error("Error fetching navbar balance:", err));
}

function updateTonBalancesUI(user) {
  db.collection("users")
    .doc(String(user.id))
    .get()
    .then((doc) => {
      if (!doc.exists) return;

      const ton = doc.data().ton || 0;
      const internal = doc.data().internalTonBalance || 0;

      const tonElem = document.getElementById("tonBalance");
      const internalElem = document.getElementById("internalTonBalance");

      if (tonElem) tonElem.textContent = ton.toFixed(2);
      if (internalElem) internalElem.textContent = internal.toFixed(2);
    });
}

function showProfileView() {
  const tg = window.Telegram?.WebApp;
  tg?.expand?.();
  const user = tg?.initDataUnsafe?.user;

  const profileNameElem = document.getElementById("userName");
  const profileImgElem = document.getElementById("profilePic");
  const coinBalanceElem = document.getElementById("coinBalance");
  const navbarBalanceElem = document.querySelector(".balance");

  if (user) {
    const fullName =
      user.first_name + (user.last_name ? " " + user.last_name : "");
    if (profileNameElem) profileNameElem.innerText = fullName;
    if (profileImgElem) {
      profileImgElem.src =
        user.photo_url ||
        `https://via.placeholder.com/150/4CAF50/ffffff?text=${encodeURIComponent(
          user.first_name[0]
        )}`;
    }

    db.collection("users")
      .doc(String(user.id))
      .get()
      .then((doc) => {
        if (doc.exists) {
          const coins = doc.data().coins || 0;
          if (coinBalanceElem) coinBalanceElem.textContent = coins;
          if (navbarBalanceElem)
            navbarBalanceElem.textContent = coins.toFixed(2);
        }
      })
      .catch((err) => console.error("Error fetching user data:", err));
  } else {
    if (profileNameElem) profileNameElem.innerText = "Guest";
    if (profileImgElem) profileImgElem.src = "user.png";
    if (coinBalanceElem) coinBalanceElem.textContent = "0";
    if (navbarBalanceElem) navbarBalanceElem.textContent = "0.00";
  }

  document.getElementById("game-list-view").style.display = "none";
  document.getElementById("game-detail-view").style.display = "none";
  document.getElementById("flappy-container").style.display = "none";
  document.getElementById("profile-view").style.display = "block";

  setupWalletButton(user); // 👈 Connect wallet when profile is shown
  updateTonBalancesUI(user);
}

// ================= GAME DISPLAY ===================
const gameData = {
  "Flappy Bird": {
    image: "Flappy_Bird.png",
    intro: "Fly the bird between pipes without hitting them!",
    gallery: Array(5).fill("Flappy_Bird.png"),
  },
  "Tic Tac Toe": {
    image: "tic_tac_toe.png",
    intro: "Outsmart the AI in this classic strategy game!",
    gallery: Array(5).fill("tic_tac_toe.png"),
  },
  Snake: {
    image: "Flappy_Bird.png",
    intro: "Eat food to grow the snake, but don’t hit yourself!",
    gallery: Array(5).fill("Flappy_Bird.png"),
  },
  Tetris: {
    image: "Flappy_Bird.png",
    intro: "Fit falling blocks together to clear lines.",
    gallery: Array(5).fill("Flappy_Bird.png"),
  },
};

function showGameDetail(gameName) {
  const data = gameData[gameName];
  if (!data) return;

  document.getElementById("game-detail-img").src = data.image;
  document.getElementById("game-detail-title").textContent = gameName;
  document.getElementById("game-detail-intro").textContent = data.intro;

  const gallery = document.getElementById("game-detail-gallery");
  gallery.innerHTML = "";
  data.gallery.forEach((img) => {
    const imgEl = document.createElement("img");
    imgEl.src = img;
    imgEl.alt = `${gameName} screenshot`;
    imgEl.className = "gallery-img";
    gallery.appendChild(imgEl);
  });

  document.getElementById("game-list-view").style.display = "none";
  document.getElementById("game-detail-view").style.display = "flex";
  document.getElementById("profile-view").style.display = "none";
  document.getElementById("flappy-container").style.display = "none";
}

function showGameList() {
  document.getElementById("game-list-view").style.display = "grid";
  document.getElementById("game-detail-view").style.display = "none";
  document.getElementById("profile-view").style.display = "none";
  document.getElementById("flappy-container").style.display = "none";
}

// ================= GAME PLAY ===================
function playGame() {
  const selectedGame = document.getElementById("game-detail-title").textContent;
  if (selectedGame === "Flappy Bird") {
    launchFlappyArcadium();
  } else if (selectedGame === "Tic Tac Toe") {
    launchTicTacToe();
  } else {
    alert("Launching " + selectedGame + "... (Coming Soon)");
  }
}

function launchFlappyArcadium() {
  document.getElementById("game-list-view").style.display = "none";
  document.getElementById("game-detail-view").style.display = "none";
  document.getElementById("profile-view").style.display = "none";

  const frameContainer = document.getElementById("flappy-container");
  frameContainer.innerHTML = `
        <iframe id="flappy-frame" src="flappy.html" style="width:100%; height:80vh; border:none;"></iframe>
        <div style="margin-top:10px; text-align:center;">
            <button onclick="retryFlappy()">Retry</button>
            <button onclick="backToDetail('Flappy Bird')">Back</button>
        </div>
    `;
  frameContainer.style.display = "block";
}

function launchTicTacToe() {
  document.getElementById("game-list-view").style.display = "none";
  document.getElementById("game-detail-view").style.display = "none";
  document.getElementById("profile-view").style.display = "none";

  const frameContainer = document.getElementById("flappy-container");
  frameContainer.innerHTML = `
        <iframe id="tictactoe-frame" src="tictactoe.html" style="width:100%; height:80vh; border:none;"></iframe>
        <div style="margin-top:10px; text-align:center;">
            <button onclick="retryTicTacToe()">Retry</button>
            <button onclick="backToDetail('Tic Tac Toe')">Back</button>
        </div>
    `;
  frameContainer.style.display = "block";
}

function retryFlappy() {
  const frame = document.getElementById("flappy-frame");
  frame.src = frame.src;
}

function retryTicTacToe() {
  const frame = document.getElementById("tictactoe-frame");
  frame.src = frame.src;
}

function backToDetail(gameName = "Flappy Bird") {
  document.getElementById("flappy-container").style.display = "none";
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
  measurementId: "G-F6C4GLX7Q5",
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
    .collection("users")
    .doc(userId)
    .collection("games")
    .doc(gameName)
    .collection("scores");

  scoresRef
    .add({
      score: score,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      console.log(
        `Score of ${score} saved for game ${gameName} under user ${userId}`
      );

      // Reward system
      let reward = 0;
      if (gameName === "Flappy Bird") {
        reward = score * 0.25;
      } else if (gameName === "Tic Tac Toe" && score === 1) {
        reward = 0.75; // Only reward on human win
      }

      if (reward > 0) {
        const userRef = db.collection("users").doc(userId);
        userRef.get().then((doc) => {
          if (doc.exists) {
            const oldCoins = doc.data().coins || 0;
            const newCoins = oldCoins + reward;

            userRef.update({ coins: newCoins }).then(() => {
              console.log(
                `User rewarded with ${reward} coins. New balance: ${newCoins}`
              );
              updateNavbarBalance(user); // refresh displayed balance
            });
          }
        });
      }
    })
    .catch((err) => {
      console.error("Error saving score:", err);
    });
}

function logEventCustom(eventName, details) {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const userId = user?.id || "Guest";

  const safeDetails = JSON.parse(JSON.stringify(details));

  db.collection("users")
    .doc(String(userId))
    .collection("logs")
    .add({
      event: eventName,
      details: safeDetails,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      console.log(`Event '${eventName}' logged for user ${userId}`);
    })
    .catch((err) => {
      console.error("Error logging event:", err);
    });
}

// =============== TON CONNECT SETUP ================

let tonConnectUI; // Make sure this is at global scope

function setupWalletButton(user) {
  const walletBtn = document.querySelector(".walletBtn");
  if (!walletBtn) return;

  initTonConnectUI(user, walletBtn);
}

async function topUpInternalBalance() {
  const amount = parseFloat(document.getElementById("topupAmount").value);
  if (isNaN(amount) || amount <= 0) {
    return alert("Enter a valid TON amount.");
  }

  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!user) return alert("User not found.");

  const userRef = db.collection("users").doc(String(user.id));
  const doc = await userRef.get();

  const walletTon = doc.data().ton || 0;
  const internalTon = doc.data().internalTonBalance || 0;

  if (walletTon < amount) {
    return alert("Not enough TON in your wallet.");
  }

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const prevTon = snap.data().ton || 0;
    const prevInternal = snap.data().internalTonBalance || 0;

    tx.update(userRef, {
      ton: parseFloat((prevTon - amount).toFixed(4)),
      internalTonBalance: parseFloat((prevInternal + amount).toFixed(4)),
    });
  });

  alert(`Topped up ${amount} TON to your Arcadium balance.`);

  document.getElementById("topupAmount").value = "";
  updateTonBalancesUI(user); // 👈 refresh display
}

function initTonConnectUI(user, walletBtn) {
  tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: "https://belugaa0.github.io/project/tonconnect-manifest.json",
    buttonRootId: "ton-connect-button-root",
  });

  walletBtn.onclick = async () => {
    const connectedWallet = tonConnectUI.wallet;

    if (connectedWallet) {
      await tonConnectUI.disconnect();
      console.log("Disconnected from wallet.");

      // Clear storage
      localStorage.removeItem("ton-connect-storage");
      sessionStorage.clear();

      // Firebase cleanup
      if (user) {
        const userRef = db.collection("users").doc(String(user.id));
        await userRef.update({
          walletAddress: firebase.firestore.FieldValue.delete(),
          ton: firebase.firestore.FieldValue.delete(),
        });
      }

      // Update UI
      walletBtn.textContent = "Connect to Wallet";
      document.getElementById("tonBalance").textContent = "0";

      // ⚠️ Full reload to clear TWA session context
      setTimeout(() => {
        location.reload(); // Required in TWA
      }, 100);
    } else {
      await tonConnectUI.openModal();
    }
  };

  // ✅ ✅ ✅ MOVE THIS INSIDE HERE
  tonConnectUI.onStatusChange(async (walletInfo) => {
    if (walletInfo?.account?.address) {
      const walletAddress = walletInfo.account.address;
      const short = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
      walletBtn.textContent = `Disconnect (${short})`;

      if (user) {
        const userRef = db.collection("users").doc(String(user.id));
        await userRef.set({ walletAddress }, { merge: true });

        const balance = await fetchTonBalance(walletAddress);
        if (!isNaN(balance)) {
          await userRef.set({ ton: balance }, { merge: true });

          // ✅ Update UI for TON
          document.getElementById("tonBalance").textContent = balance;

          // ✅ Also update coin balance in navbar and profile
          updateNavbarBalance(user);
          const profileCoins = document.getElementById("coinBalance");
          if (profileCoins) {
            profileCoins.textContent = balance.toFixed(2); // or leave it if balance !== coins
          }
        }
      }
    }
  });
}

async function fetchTonBalance(walletAddress) {
  try {
    const res = await fetch(
      `https://testnet.tonapi.io/v2/accounts/${walletAddress}`
    );
    const data = await res.json();
    return (data.balance || 0) / 1e9; // nanoTON → TON
  } catch (e) {
    console.error("Failed to fetch balance:", e);
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
    const scoresRef = userRef
      .collection("games")
      .doc("Flappy Bird")
      .collection("scores");

    // Save the score
    await scoresRef.add({
      score: score,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
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
        const newVal =
          parseFloat(profileCoins.textContent || "0") + earnedCoins;
        profileCoins.textContent = newVal.toFixed(2);
      }
    }
  }
});

// Modal Controls
function openDepositModal() {
  document.getElementById("depositModal").style.display = "flex";
}

function closeDepositModal() {
  document.getElementById("depositModal").style.display = "none";
}

function openWithdrawModal() {
  document.getElementById("withdrawModal").style.display = "flex";
}

function closeWithdrawModal() {
  document.getElementById("withdrawModal").style.display = "none";
}

// Example handlers (you can customize logic)
async function handleDeposit() {
  const amountInput = document.getElementById("depositAmount");
  const amount = parseFloat(amountInput.value);

  if (isNaN(amount) || amount <= 0) {
    return alert("Enter a valid TON amount.");
  }

  const wallet = tonConnectUI.wallet;
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

  if (!wallet || !user) {
    return alert("Please connect your wallet first.");
  }

  const nanoTON = Math.round(amount * 1e9); // TON → nanoTON
  const bankAddress =
    "0:6da5d6494e6928bf830486ce8479b05f4deb23400d280bcd14bd8af0580d05d3";

  const tx = {
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
      {
        address: bankAddress,
        amount: nanoTON.toString(),
      },
    ],
  };

  try {
    await tonConnectUI.sendTransaction(tx);
    alert(
      `✅ Sent ${amount} TON to Arcadium Bank!\nNow verifying your deposit...`
    );

    amountInput.value = "";
    closeDepositModal();

    logEventCustom("TON Deposit Sent", {
      amount,
      to: bankAddress,
    });

    // Start verifying deposit after short delay
    setTimeout(() => {
      verifyUserDeposit(wallet.account.address, bankAddress, amount, user.id);
    }, 1000);
  } catch (e) {
    console.error("Transaction failed", e);
    alert("❌ Transaction failed or rejected.");
  }
}

async function verifyUserDeposit(
  userWalletAddress,
  bankWalletAddress,
  expectedAmount,
  userId
) {
  const maxTries = 15;
  let tries = 0;

  const interval = setInterval(async () => {
    tries++;
    if (tries > maxTries) {
      clearInterval(interval);
      console.warn("Deposit verification timed out.");
      alert("⚠️ Couldn't verify deposit. Try again later.");
      return;
    }

    try {
      const res = await fetch(
        `https://tonapi.io/v2/blockchain/accounts/${bankWalletAddress}/transactions?limit=10`
      );
      const data = await res.json();
      const txs = data.transactions;

      const matchingTx = txs.find((tx) => {
        return (
          tx.in_msg?.source?.toLowerCase() ===
            userWalletAddress.toLowerCase() &&
          parseFloat(tx.in_msg?.value || "0") / 1e9 >= expectedAmount
        );
      });

      if (matchingTx) {
        clearInterval(interval);
        console.log("✅ Deposit verified on chain!");

        // Update internal balance in Firebase
        const userRef = db.collection("users").doc(String(userId));
        await db.runTransaction(async (tx) => {
          const snap = await tx.get(userRef);
          const currentBalance = snap.data().internalTonBalance || 0;
          const newBalance = parseFloat(
            (currentBalance + expectedAmount).toFixed(4)
          );
          tx.update(userRef, { internalTonBalance: newBalance });
        });

        alert(
          `🎉 ${expectedAmount} TON has been added to your internal Arcadium balance.`
        );
        db.collection("users")
          .doc(String(userId))
          .get()
          .then((doc) => {
            if (doc.exists) {
              const userData = doc.data();
              updateTonBalancesUI({
                id: userId,
                ton: userData.ton,
                internalTonBalance: userData.internalTonBalance,
              });
            }
          });
      }
    } catch (err) {
      console.error("Error verifying deposit:", err);
    }
  }, 4000); // check every 4 sec
}

function handleWithdraw() {
  const address = document.getElementById("withdrawAddress").value;
  const amount = document.getElementById("withdrawAmount").value;
  if (address && amount && Number(amount) > 0) {
    alert(`Withdrew ${amount} TON to ${address}`);
    closeWithdrawModal();
  }
}
