import { EndlessStairsGame } from './game.js';

const stepsEl = document.querySelector('[data-steps]');
const scoreEl = document.querySelector('[data-score]');
const bestEl = document.querySelector('[data-best]');
const speedEl = document.querySelector('[data-speed]');
const statusEl = document.querySelector('[data-status]');
const timerFillEl = document.querySelector('[data-timer-fill]');
const restartButton = document.querySelector('[data-restart]');
const controlButtons = document.querySelectorAll('[data-move]');

const BEST_SCORE_KEY = 'stairs-runner-best-score';

let game = null;
let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
let timeRemaining = 100;
let lastFrame = 0;

function createGame() {
  game = new EndlessStairsGame();
  timeRemaining = 100;
  lastFrame = 0;
  statusEl.textContent = '← → 방향키나 버튼으로 다음 계단을 맞춰 올라가세요.';
  render();
}

function render() {
  const steps = game.getVisibleSteps();
  const player = game.getPlayerState();

  stepsEl.innerHTML = '';

  for (let rowIndex = steps.length - 1; rowIndex >= 0; rowIndex -= 1) {
    const step = steps[rowIndex];
    const row = document.createElement('div');
    row.className = 'step-row';

    for (let lane = 0; lane < 3; lane += 1) {
      const tile = document.createElement('div');
      const isSafe = lane === step.safeLane;
      const playerOnTile = lane === player.lane && step.index === 0;

      tile.className = 'tile';
      if (isSafe) tile.classList.add('safe');
      if (playerOnTile) tile.classList.add('player');
      if (!isSafe) tile.classList.add('void');
      row.appendChild(tile);
    }

    stepsEl.appendChild(row);
  }

  scoreEl.textContent = String(game.getScore());
  bestEl.textContent = String(bestScore);
  speedEl.textContent = `${game.getSpeed().toFixed(2)}x`;
  timerFillEl.style.width = `${Math.max(0, timeRemaining)}%`;

  document.body.dataset.gameOver = String(game.isGameOver());
}

function move(directionDelta) {
  if (game.isGameOver()) return;

  const result = game.step(directionDelta);

  if (result.status === 'advanced') {
    timeRemaining = 100;
    if (game.getScore() > bestScore) {
      bestScore = game.getScore();
      localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
    }
    statusEl.textContent = `좋아요! 속도 ${game.getSpeed().toFixed(2)}x`;
  } else {
    statusEl.textContent = `발을 헛디뎠어요. 최종 점수 ${game.getScore()}점`;
  }

  render();
}

function gameLoop(timestamp) {
  if (!lastFrame) lastFrame = timestamp;
  const delta = timestamp - lastFrame;
  lastFrame = timestamp;

  if (!game.isGameOver()) {
    const drainRate = 0.028 * game.getSpeed();
    timeRemaining -= delta * drainRate;

    if (timeRemaining <= 0) {
      game.forfeit('timeout');
      statusEl.textContent = `시간 초과! 최종 점수 ${game.getScore()}점`;
      render();
    } else {
      render();
    }
  }

  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
    move(-1);
  }

  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
    move(1);
  }

  if (event.key === 'ArrowUp' || event.key === ' ') {
    event.preventDefault();
    move(0);
  }

  if (event.key.toLowerCase() === 'r') {
    createGame();
  }
});

controlButtons.forEach((button) => {
  button.addEventListener('click', () => {
    move(Number(button.dataset.move));
  });
});

restartButton.addEventListener('click', createGame);

createGame();
requestAnimationFrame(gameLoop);
