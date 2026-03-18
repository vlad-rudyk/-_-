const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const clickButton = document.getElementById("clickButton");
const startButton = document.getElementById("startButton");
const messageEl = document.getElementById("message");
const confettiContainer = document.getElementById("confetti");

const GAME_DURATION_SECS = 10;
let remainingTime = GAME_DURATION_SECS;
let score = 0;
let bestScore = 0;
let gameInterval = null;
let isPlaying = false;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playTone(frequency, length = 0.08, volume = 0.15) {
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, now);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + length);
}

function showMessage(text, type = "success", duration = 2500) {
  messageEl.textContent = text;
  messageEl.className = `message visible ${type}`;

  clearTimeout(messageEl._hideTimeout);
  messageEl._hideTimeout = setTimeout(() => {
    messageEl.classList.remove("visible");
  }, duration);
}

function updateScore(newScore) {
  score = newScore;
  scoreEl.textContent = score;
  if (score > bestScore) {
    bestScore = score;
    bestScoreEl.textContent = bestScore;
  }
}

function updateTimer(seconds) {
  remainingTime = seconds;
  timerEl.textContent = remainingTime.toFixed(1);
}

function setGameActive(active) {
  isPlaying = active;
  clickButton.disabled = !active;
  startButton.disabled = active;
  startButton.setAttribute("aria-busy", String(active));

  if (!active) {
    clickButton.classList.remove("active");
  }
}

function startGame() {
  if (isPlaying) return;

  updateScore(0);
  updateTimer(GAME_DURATION_SECS);
  setGameActive(true);
  showMessage("Гра почалася! Клікай якнайшвидше!", "success", 2000);
  playTone(780, 0.09, 0.18);

  gameInterval = setInterval(() => {
    updateTimer(Math.max(0, remainingTime - 0.1));

    if (remainingTime <= 0) {
      endGame();
    }
  }, 100);
}

function endGame() {
  clearInterval(gameInterval);
  setGameActive(false);

  const isPersonalBest = score >= bestScore;
  const message = isPersonalBest
    ? `Нова рекордна кількість: ${score}! 🎉`
    : `Ти набрав ${score} очок. Спробуй ще раз!`;

  showMessage(message, isPersonalBest ? "success" : "error", 3500);
  playTone(isPersonalBest ? 520 : 320, 0.2, 0.18);

  if (isPersonalBest) {
    burstConfetti();
  }
}

function burstConfetti() {
  const count = 24;
  const hueStart = 180;

  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("div");
    piece.classList.add("piece");

    const direction = Math.random() * 360;
    const distance = 160 + Math.random() * 80;
    const x = Math.cos((direction * Math.PI) / 180) * distance;
    const rotation = (Math.random() - 0.5) * 720;

    piece.style.setProperty("--x", `${x.toFixed(0)}px`);
    piece.style.setProperty("--r", `${rotation.toFixed(0)}deg`);

    const hue = hueStart + i * (180 / count);
    piece.style.background = `hsl(${hue}, 85%, 60%)`;

    const delay = Math.random() * 0.15;
    piece.style.animationDelay = `${delay}s`;

    confettiContainer.appendChild(piece);

    piece.addEventListener("animationend", () => {
      piece.remove();
    });
  }
}

function handleClick() {
  if (!isPlaying) return;

  updateScore(score + 1);
  playTone(880, 0.04, 0.14);

  clickButton.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.12)" },
      { transform: "scale(1)" },
    ],
    {
      duration: 120,
      easing: "ease-out",
    }
  );
}

startButton.addEventListener("click", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  startGame();
});

clickButton.addEventListener("click", handleClick);

// Accessibility: allow space/enter on button element via keyboard
clickButton.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "Enter") {
    event.preventDefault();
    handleClick();
  }
});

// Ensure timer renders correctly on load
updateTimer(GAME_DURATION_SECS);
