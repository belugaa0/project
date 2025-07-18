let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-btn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");

let turnO = true; // Human starts
let count = 0;

const winPatterns = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [3, 4, 5],
  [6, 7, 8],
];

// Reset game
const resetGame = () => {
  turnO = true;
  count = 0;
  enableBoxes();
  msgContainer.classList.add("hide");
};

// Show winner
const showWinner = (winner) => {
  msg.innerText = `Congratulations, Winner is ${winner}`;
  msgContainer.classList.remove("hide");
  disableBoxes();

  // Save score based on result
  if (window.parent && window.parent.saveScore) {
    window.parent.saveScore("Tic Tac Toe", winner === "O" ? 1 : 0); // 1 for human win
  }

  if (window.parent && window.parent.logEventCustom) {
    window.parent.logEventCustom("GameOver", {
      game: "Tic Tac Toe",
      result: winner,
    });
  }
};

// Disable all boxes
const disableBoxes = () => {
  boxes.forEach((box) => (box.disabled = true));
};

// Enable and clear all boxes
const enableBoxes = () => {
  boxes.forEach((box) => {
    box.innerText = "";
    box.disabled = false;
  });
};

// Check if there is a winner
const checkWinner = () => {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (
      boxes[a].innerText &&
      boxes[a].innerText === boxes[b].innerText &&
      boxes[a].innerText === boxes[c].innerText
    ) {
      showWinner(boxes[a].innerText);
      return boxes[a].innerText;
    }
  }
  return null;
};

// Show draw message
const gameDraw = () => {
  msg.innerText = "Game was a Draw.";
  msgContainer.classList.remove("hide");
  disableBoxes();

  if (window.parent && window.parent.saveScore) {
    window.parent.saveScore("Tic Tac Toe", 0.5); // 0.5 for draw
  }

  if (window.parent && window.parent.logEventCustom) {
    window.parent.logEventCustom("GameOver", {
      game: "Tic Tac Toe",
      result: "Draw",
    });
  }
};

// Get board as array
const getBoard = () => {
  return Array.from(boxes).map((box) => box.innerText);
};

// Evaluate board state for win/loss
const evaluate = (board) => {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      if (board[a] === "X") return 10;
      if (board[a] === "O") return -10;
    }
  }
  return 0;
};

// Place move and check for end
const placeMove = (index, player) => {
  boxes[index].innerText = player;
  boxes[index].disabled = true;
  count++;
  let result = checkWinner();
  if (!result && count === 9) gameDraw();
  turnO = true;
};

// Random AI move
const makeRandomMove = () => {
  let board = getBoard();
  let emptyCells = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") emptyCells.push(i);
  }

  if (emptyCells.length > 0) {
    let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    placeMove(randomIndex, "X");
  }
};

// Medium AI move (70% smart, 30% random)
const mediumAIMove = () => {
  const chance = Math.random(); // 0 to 1

  if (chance < 0.3) {
    makeRandomMove(); // 30% chance to play dumb
  } else {
    let board = getBoard();

    // Try to win
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        if (evaluate(board) === 10) {
          placeMove(i, "X");
          return;
        }
        board[i] = "";
      }
    }

    // Try to block human
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        if (evaluate(board) === -10) {
          board[i] = "";
          placeMove(i, "X");
          return;
        }
        board[i] = "";
      }
    }

    // Else random move
    makeRandomMove();
  }
};

// Human move handler
boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (turnO && box.innerText === "") {
      box.innerText = "O";
      box.disabled = true;
      count++;
      let result = checkWinner();
      if (!result && count < 9) {
        turnO = false;
        setTimeout(() => mediumAIMove(), 400); // Delay for realism
      } else if (count === 9 && !result) {
        gameDraw();
      }
    }
  });
});

// Buttons
resetBtn.addEventListener("click", resetGame);
newGameBtn.addEventListener("click", resetGame);
