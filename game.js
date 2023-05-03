const canvas = document.getElementById('game-canvas');
canvas.width = 600;
canvas.height = 400;
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const scoreElem = document.getElementById('score');
const nameForm = document.getElementById('name-form');
const leaderboardBody = document.querySelector('#leaderboard tbody');

const CELL_SIZE = 10;
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const NUM_COLS = CANVAS_WIDTH / CELL_SIZE;
const NUM_ROWS = CANVAS_HEIGHT / CELL_SIZE;

let snake = [{x: 5, y: 5}];
let food = {};
let score = 0;
let direction = 'right';
let isPaused = false;
let intervalId;
let playerName = '';
let leaderboard = [];

function init() {
  createFood();
  drawSnake();
  startBtn.addEventListener('click', startGame);
  pauseBtn.addEventListener('click', pauseGame);
  resumeBtn.addEventListener('click', resumeGame);
  document.addEventListener('keydown', handleKeyDown);
  nameForm.addEventListener('submit', handleSubmit);
}

function createFood() {
  const edgeDist = 1; // distance from the edges
  const borderProb = 0.7; // probability of appearing near the border
  const xRange = NUM_COLS - edgeDist * 2;
  const yRange = NUM_ROWS - edgeDist * 2;
  do {
    if (Math.random() < borderProb) {
      // Generate coordinates near the border
      const nearBorder = Math.random() < 0.5;
      const nearX = nearBorder ? edgeDist : NUM_COLS - edgeDist - 1;
      const nearY = Math.floor(Math.random() * yRange + edgeDist);
      food = { x: nearX, y: nearY };
    } else {
      // Generate coordinates randomly
      const randomX = Math.floor(Math.random() * xRange + edgeDist);
      const randomY = Math.floor(Math.random() * yRange + edgeDist);
      food = { x: randomX, y: randomY };
    }
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

function drawFood() {
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawSnake() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  snake.forEach(segment => {
    ctx.fillStyle = 'green';
    ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  });
  drawFood();
}

function moveSnake() {
  const head = snake[0];
  let newHead;
  switch (direction) {
    case 'right':
      newHead = {x: head.x + 1, y: head.y};
      break;
    case 'down':
      newHead = {x: head.x, y: head.y + 1};
      break;
    case 'left':
      newHead = {x: head.x - 1, y: head.y};
      break;
    case 'up':
      newHead = {x: head.x, y: head.y - 1};
      break;
  }
  if (newHead.x === food.x && newHead.y === food.y) {
    score++;
    scoreElem.textContent = `Score: ${score}`;
    createFood();
  } else {
    snake.pop();
  }
 snake.unshift(newHead);
  }

  function isGameOver() {
    const head = snake[0];
    return (
head.x < 0 ||
head.x >= NUM_COLS ||
head.y < 0 ||
head.y >= NUM_ROWS ||
snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
);
}

function startGame() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  isPaused = false;
  score = 0;
  scoreElem.textContent = `Score: ${score}`; // corrected line
  // Update the initial position of the snake
  snake = [    { x: NUM_COLS / 2, y: NUM_ROWS / 2 },    { x: NUM_COLS / 2 - 1, y: NUM_ROWS / 2 }  ];
  createFood();
  intervalId = setInterval(() => {
    if (!isPaused) {
      moveSnake();
      drawSnake();
      if (isGameOver()) {
        clearInterval(intervalId);
        addScoreToLeaderboard(playerName, score);
        showLeaderboard();
        alert('Game over!');
      }
    }
  }, 40);
}

function pauseGame() {
isPaused = true;
}

function resumeGame() {
isPaused = false;
}

function handleKeyDown(event) {
switch (event.code) {
case 'ArrowRight':
if (direction !== 'left') {
direction = 'right';
}
break;
case 'ArrowDown':
if (direction !== 'up') {
direction = 'down';
}
break;
case 'ArrowLeft':
if (direction !== 'right') {
direction = 'left';
}
break;
case 'ArrowUp':
if (direction !== 'down') {
direction = 'up';
}
break;
}
}

function handleSubmit(event) {
event.preventDefault();
playerName = event.target.elements.name.value;
event.target.reset();
}

function addScoreToLeaderboard(name, score) {
leaderboard.push({ name, score });
leaderboard.sort((a, b) => b.score - a.score);
if (leaderboard.length > 10) {
leaderboard.pop();
}
localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function showLeaderboard() {
leaderboardBody.innerHTML = '';
const savedLeaderboard = localStorage.getItem('leaderboard');
if (savedLeaderboard) {
leaderboard = JSON.parse(savedLeaderboard);
}
leaderboard.forEach((entry, index) => {
const row = document.createElement('tr');
const rankCol = document.createElement('td');
const nameCol = document.createElement('td');
const scoreCol = document.createElement('td');
rankCol.textContent = index + 1;
nameCol.textContent = entry.name;
scoreCol.textContent = entry.score;
row.append(rankCol, nameCol, scoreCol);
leaderboardBody.appendChild(row);
});
}

init();
