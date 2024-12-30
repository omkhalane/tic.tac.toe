const board = document.getElementById("board");
const status = document.getElementById("status");
const restartButton = document.getElementById("restart");
const resetButton = document.getElementById("reset");
const difficultySelect = document.getElementById("difficulty");
const playerNameInput = document.getElementById("player-name");
const startGameButton = document.getElementById("start-game");
const playerScoreElement = document.getElementById("player-score");
const computerScoreElement = document.getElementById("computer-score");
const playerNameDisplay = document.getElementById("player-name-display");
const scoreTable = document.getElementById("score-table");

let playerName = "Player";
let currentPlayer = "X";
let gameActive = false;
let gameState = ["", "", "", "", "", "", "", "", ""];
let difficulty = "easy";
let playerScore = 0;
let computerScore = 0;

// Score system based on difficulty
const scoreSystem = {
  easy: { win: 1, lose: -0.5 },
  medium: { win: 2, lose: -1 },
  hard: { win: 4, lose: -2 },
  legend: { win: 8, lose: -5 },
};

// Winning combinations
const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Initialize the board
function createBoard() {
  board.innerHTML = "";
  gameState.forEach((cell, index) => {
    const cellElement = document.createElement("div");
    cellElement.classList.add("cell");
    cellElement.dataset.index = index;
    cellElement.addEventListener("click", handleCellClick);
    board.appendChild(cellElement);
  });
}

// Start the game
startGameButton.addEventListener("click", () => {
  const enteredName = playerNameInput.value.trim();
  if (!enteredName) {
    alert("Please enter a valid name to start the game.");
    return;
  }

  playerName = enteredName;
  difficulty = difficultySelect.value;
  playerNameDisplay.textContent = playerName;

  // Disable name and mode inputs after game starts
  playerNameInput.disabled = true;
  difficultySelect.disabled = true;
  startGameButton.disabled = true;

  scoreTable.style.display = "table";
  restartButton.style.display = "inline-block";
  resetButton.style.display = "inline-block";
  status.textContent = `${playerName}'s turn`;

  gameActive = true;
  createBoard();
});

// Handle cell click
function handleCellClick(event) {
  if (!gameActive || currentPlayer !== "X") return;

  const clickedCell = event.target;
  const cellIndex = clickedCell.dataset.index;

  if (gameState[cellIndex] !== "") return;

  gameState[cellIndex] = currentPlayer;
  clickedCell.textContent = currentPlayer;

  if (checkWin()) {
    updateScore("win", "player");
    return;
  }

  if (gameState.every(cell => cell !== "")) {
    status.textContent = "It's a draw!";
    gameActive = false;
    setTimeout(resetRound, 1500);
    return;
  }

  currentPlayer = "O";
  status.textContent = "Om Khalane's turn";
  setTimeout(computerMove, 500);
}

// Computer's move logic
function computerMove() {
  if (!gameActive) return;

  let move;
  switch (difficulty) {
    case "easy":
      move = easyMove();
      break;
    case "medium":
      move = mediumMove();
      break;
    case "hard":
      move = hardMove();
      break;
    case "legend":
      move = minimax(gameState, "O").index;
      break;
  }

  gameState[move] = "O";
  document.querySelector(`.cell[data-index='${move}']`).textContent = "O";

  if (checkWin()) {
    updateScore("lose", "player");
    return;
  }

  if (gameState.every(cell => cell !== "")) {
    status.textContent = "It's a draw!";
    gameActive = false;
    setTimeout(resetRound, 1500);
    return;
  }

  currentPlayer = "X";
  status.textContent = `${playerName}'s turn`;
}

// Check for a win
function checkWin() {
  return winningConditions.some(condition => {
    return condition.every(index => gameState[index] === currentPlayer);
  });
}

// Update scores
function updateScore(result, player) {
  const points = scoreSystem[difficulty][result];
  if (player === "player") {
    playerScore += points;
    playerScoreElement.textContent = playerScore;
  } else {
    computerScore += points;
    computerScoreElement.textContent = computerScore;
  }

  status.textContent = result === "win" ? `${playerName} wins!` : "Om Khalane wins!";
  gameActive = false;
  setTimeout(resetRound, 2000);
}

// Reset the board for the next round
function resetRound() {
  gameState = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  createBoard();
  status.textContent = `${playerName}'s turn`;
}

// Reset the entire game
resetButton.addEventListener("click", () => {
  playerNameInput.disabled = false;
  difficultySelect.disabled = false;
  startGameButton.disabled = false;

  playerNameInput.value = "";
  playerScore = 0;
  computerScore = 0;

  playerScoreElement.textContent = "0";
  computerScoreElement.textContent = "0";

  scoreTable.style.display = "none";
  restartButton.style.display = "none";
  resetButton.style.display = "none";

  status.textContent = "Enter your name to start the game!";
  createBoard();
});

// AI move logic for easy mode (random move)
function easyMove() {
  const availableMoves = gameState.map((cell, index) => (cell === "" ? index : null)).filter(index => index !== null);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// AI move logic for medium mode (smart random)
function mediumMove() {
  const winningMove = findWinningMove("O");
  if (winningMove !== null) return winningMove;

  const blockingMove = findWinningMove("X");
  if (blockingMove !== null) return blockingMove;

  return easyMove();
}

// AI move logic for hard mode (prioritize winning/blocking)
function hardMove() {
  const winningMove = findWinningMove("O");
  if (winningMove !== null) return winningMove;

  const blockingMove = findWinningMove("X");
  if (blockingMove !== null) return blockingMove;

  return easyMove();
}

// Check for a winning move
function findWinningMove(player) {
  for (const condition of winningConditions) {
    const [a, b, c] = condition;
    const values = [gameState[a], gameState[b], gameState[c]];
    if (values.filter(v => v === player).length === 2 && values.includes("")) {
      return condition[values.indexOf("")];
    }
  }
  return null;
}

// Minimax algorithm for unbeatable "legend" mode
function minimax(state, player) {
  const availableMoves = state.map((cell, index) => (cell === "" ? index : null)).filter(index => index !== null);

  if (checkWinCondition(state, "X")) return { score: -10 };
  if (checkWinCondition(state, "O")) return { score: 10 };
  if (availableMoves.length === 0) return { score: 0 };

  const moves = [];
  for (const move of availableMoves) {
    const newState = [...state];
    newState[move] = player;

    const result = minimax(newState, player === "O" ? "X" : "O");
    moves.push({ index: move, score: result.score });
  }

  return moves.reduce((best, current) => {
    if (player === "O" && current.score > best.score) return current;
    if (player === "X" && current.score < best.score) return current;
    return best;
  });
}

function checkWinCondition(state, player) {
  return winningConditions.some(condition => condition.every(index => state[index] === player));
}
// Function to show firecrackers
function triggerFirecrackers(winner) {
  const fireworksContainer = document.createElement("div");
  fireworksContainer.id = "fireworks";
  document.body.appendChild(fireworksContainer);

  // Generate multiple firecrackers
  for (let i = 0; i < 30; i++) {
    const firework = document.createElement("div");
    firework.className = "firework";

    // Random position and animation delay
    firework.style.left = Math.random() * 100 + "vw";
    firework.style.top = Math.random() * 100 + "vh";
    firework.style.animationDelay = Math.random() * 0.5 + "s";

    fireworksContainer.appendChild(firework);
  }

  // Show winner's name
  status.textContent = `${winner} wins!`;

  // Remove firecrackers after 2 seconds
  setTimeout(() => {
    fireworksContainer.remove();
    resetRound();
  }, 2000);
}

// Update the score function to include firecrackers
function updateScore(result, player) {
  const points = scoreSystem[difficulty][result];
  if (player === "player") {
    playerScore += points;
    playerScoreElement.textContent = playerScore;
    triggerFirecrackers(playerName);
  } else {
    computerScore += points;
    computerScoreElement.textContent = computerScore;
    triggerFirecrackers("Om Khalane");
  }
  
}// Firecracker logic
function triggerFirecrackers(winner) {
  const fireworksContainer = document.createElement("div");
  fireworksContainer.id = "fireworks";
  document.body.appendChild(fireworksContainer);

  // Generate multiple firecrackers
  for (let i = 0; i < 30; i++) {
    const firework = document.createElement("div");
    firework.className = "firework";

    // Random position and animation delay
    firework.style.left = Math.random() * 100 + "vw";
    firework.style.top = Math.random() * 100 + "vh";
    firework.style.animationDelay = Math.random() * 0.5 + "s";

    fireworksContainer.appendChild(firework);
  }

  // Remove firecrackers after 2 seconds
  setTimeout(() => {
    fireworksContainer.remove();
    resetRound();
  }, 2000);
}

// Function to show the winner popup
function showWinnerPopup(winner) {
  let popup = document.getElementById("winner-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "winner-popup";
    document.body.appendChild(popup);
  }

  popup.innerHTML = `<span>${winner}</span> wins!`;

  // Show the popup
  popup.classList.add("show");

  // Hide the popup after 2 seconds
  setTimeout(() => {
    popup.classList.remove("show");
  }, 2000);
}

// Update the score function to include the popup and firecrackers
function updateScore(result, player) {
  const points = scoreSystem[difficulty][result];
  if (player === "player") {
    playerScore += points;
    playerScoreElement.textContent = playerScore;
    showWinnerPopup(playerName);    // Show winner popup
    triggerFirecrackers(playerName); // Trigger firecrackers
  } else {
    computerScore += points;
    computerScoreElement.textContent = computerScore;
    showWinnerPopup("Om Khalane"); // Show winner popup
    triggerFirecrackers("Om Khalane"); // Trigger firecrackers
  }
}

// Reset the round logic
function resetRound() {
  gameState = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  createBoard();
  status.textContent = `${playerName}'s turn`;
}// Function to trigger firecrackers (for wins only)
function triggerFirecrackers(winner) {
  const fireworksContainer = document.createElement("div");
  fireworksContainer.id = "fireworks";
  document.body.appendChild(fireworksContainer);

  // Generate multiple firecrackers
  for (let i = 0; i < 30; i++) {
    const firework = document.createElement("div");
    firework.className = "firework";

    // Random position and animation delay
    firework.style.left = Math.random() * 100 + "vw";
    firework.style.top = Math.random() * 100 + "vh";
    firework.style.animationDelay = Math.random() * 0.5 + "s";

    fireworksContainer.appendChild(firework);
  }

  // Remove firecrackers after 2 seconds
  setTimeout(() => {
    fireworksContainer.remove();
    resetRound();
  }, 2000);
}

// Function to show popup for winner or loser
function showResultPopup(result, playerName) {
  let popup = document.getElementById("winner-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "winner-popup";
    document.body.appendChild(popup);
  }

  if (result === "win") {
    popup.innerHTML = `<span>${playerName}</span> wins!`;
    popup.classList.add("show");

    // Firecrackers for wins
    triggerFirecrackers(playerName);
  } else if (result === "lose") {
    popup.innerHTML = `<span>${playerName}</span> loses!`;
    popup.classList.add("show");
  } else if (result === "draw") {
    popup.innerHTML = `It's a draw!`;
    popup.classList.add("show");
  }

  // Hide the popup after 2 seconds
  setTimeout(() => {
    popup.classList.remove("show");
    resetRound();
  }, 2000);
}

// Update the score function to handle wins, losses, and draws
function updateScore(outcome, currentPlayer) {
  const points = scoreSystem[difficulty][outcome];

  if (outcome === "win") {
    if (currentPlayer === "player") {
      playerScore += points;
      playerScoreElement.textContent = playerScore;
      showResultPopup("win", playerName);
    } else {
      computerScore += points;
      computerScoreElement.textContent = computerScore;
      showResultPopup("win", "Om Khalane");
    }
  } else if (outcome === "lose") {
    if (currentPlayer === "player") {
      playerScore += points; // Deducts for loss (negative points)
      playerScoreElement.textContent = playerScore;
      showResultPopup("lose", playerName);
    } else {
      computerScore += points;
      computerScoreElement.textContent = computerScore;
      showResultPopup("lose", "Om Khalane");
    }
  } else if (outcome === "draw") {
    showResultPopup("draw");
  }
}

// Game over logic (checks win/loss/draw)
function handleGameOver() {
  const winner = checkWinner();
  if (winner) {
    if (winner === "X" && currentPlayer === "player") {
      updateScore("win", "player");
    } else if (winner === "X" && currentPlayer === "computer") {
      updateScore("win", "computer");
    } else if (winner === "O" && currentPlayer === "player") {
      updateScore("lose", "player");
    } else if (winner === "O" && currentPlayer === "computer") {
      updateScore("lose", "computer");
    }
  } else if (!gameState.includes("")) {
    // Draw condition
    updateScore("draw");
  }
}