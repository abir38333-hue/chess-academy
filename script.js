
// Mobile menu
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("open");
});

// Chessboard
const game = new Chess();
const board = document.getElementById("board");

const symbols = {
  wk: "♔", wq: "♕", wr: "♖",
  wb: "♗", wn: "♘", wp: "♙",
  bk: "♚", bq: "♛", br: "♜",
  bb: "♝", bn: "♞", bp: "♟"
};

let selected = null;
let targets = [];

function drawBoard() {
  board.innerHTML = "";
  const position = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const squareName = "abcdefgh"[c] + (8 - r);
      const piece = position[r][c];

      const button = document.createElement("button");
      button.className =
        "square " + ((r + c) % 2 === 0 ? "light" : "dark");

      if (selected === squareName) {
        button.classList.add("selected");
      }

      if (targets.includes(squareName)) {
        button.classList.add("target");
      }

      if (piece) {
        button.textContent = symbols[piece.color + piece.type];
      }

      button.addEventListener("click", () => {
        handleSquare(squareName);
      });

      board.appendChild(button);
    }
  }

  updateInfo();
}

function handleSquare(squareName) {
  if (game.game_over()) return;

  if (selected && targets.includes(squareName)) {
    game.move({
      from: selected,
      to: squareName,
      promotion: "q"
    });

    selected = null;
    targets = [];
    drawBoard();
    return;
  }

  const piece = game.get(squareName);

  if (piece && piece.color === game.turn()) {
    selected = squareName;

    targets = game.moves({
      square: squareName,
      verbose: true
    }).map(move => move.to);
  } else {
    selected = null;
    targets = [];
  }

  drawBoard();
}

function updateInfo() {
  const turn = document.getElementById("turn");
  const message = document.getElementById("boardMessage");
  const moveList = document.getElementById("moves");

  if (game.game_over()) {
    turn.textContent = "Game over";
    message.textContent = game.in_checkmate()
      ? "Checkmate! The game is over."
      : "The game has ended in a draw.";
  } else {
    turn.textContent =
      game.turn() === "w" ? "White to move" : "Black to move";

    message.textContent = selected
      ? "Choose a highlighted square."
      : "Select one of your pieces.";
  }

  moveList.innerHTML = "";

  const history = game.history();

  if (history.length === 0) {
    moveList.innerHTML = "<li>No moves yet</li>";
  } else {
    for (let i = 0; i < history.length; i += 2) {
      const li = document.createElement("li");
      li.textContent =
        history[i] + (history[i + 1] ? " — " + history[i + 1] : "");
      moveList.appendChild(li);
    }
  }
}

document.getElementById("resetBoard").addEventListener("click", () => {
  game.reset();
  selected = null;
  targets = [];
  drawBoard();
});

document.getElementById("undoMove").addEventListener("click", () => {
  game.undo();
  selected = null;
  targets = [];
  drawBoard();
});

drawBoard();

// Chess quiz
const questions = [
  {
    question: "How many squares are on a chessboard?",
    answers: ["32", "64", "72", "100"],
    correct: 1
  },
  {
    question: "Which piece moves in an L-shape?",
    answers: ["Bishop", "Rook", "Knight", "Queen"],
    correct: 2
  },
  {
    question: "Which piece must you protect?",
    answers: ["Pawn", "King", "Bishop", "Rook"],
    correct: 1
  },
  {
    question: "How does a bishop move?",
    answers: ["Straight", "Diagonally", "In an L-shape", "One square only"],
    correct: 1
  },
  {
    question: "What does checkmate mean?",
    answers: [
      "The king is safe",
      "A pawn is promoted",
      "The king cannot escape check",
      "The game is starting"
    ],
    correct: 2
  }
];

let currentQuestion = 0;
let score = 0;
let answered = false;

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("nextQuestion");

function showQuestion() {
  const q = questions[currentQuestion];

  answered = false;
  questionEl.textContent = q.question;
  answersEl.innerHTML = "";
  feedbackEl.textContent = "";

  document.getElementById("questionCount").textContent =
    `Question ${currentQuestion + 1} of ${questions.length}`;

  nextBtn.disabled = true;
  nextBtn.textContent = "Next Question";

  q.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.textContent = answer;

    button.addEventListener("click", () => {
      checkAnswer(index);
    });

    answersEl.appendChild(button);
  });
}

function checkAnswer(index) {
  if (answered) return;

  answered = true;
  const correct = questions[currentQuestion].correct;
  const buttons = answersEl.querySelectorAll("button");

  buttons.forEach((button, i) => {
    button.disabled = true;

    if (i === correct) {
      button.classList.add("correct");
    } else if (i === index) {
      button.classList.add("wrong");
    }
  });

  if (index === correct) {
    score++;
    feedbackEl.textContent = "Correct answer! Well done.";
  } else {
    feedbackEl.textContent =
      "Incorrect. The correct answer is: " +
      questions[currentQuestion].answers[correct];
  }

  nextBtn.disabled = false;
}

nextBtn.addEventListener("click", () => {
  if (!answered) return;

  currentQuestion++;

  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    questionEl.textContent =
      `Your score: ${score} out of ${questions.length}`;

    answersEl.innerHTML = "";
    feedbackEl.textContent =
      "Great effort! Keep practising chess.";

    nextBtn.textContent = "Try Again";
    nextBtn.disabled = false;

    nextBtn.onclick = () => {
      currentQuestion = 0;
      score = 0;
      nextBtn.onclick = null;
      showQuestion();
    };
  }
});

showQuestion();
