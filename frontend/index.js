// Farben von Elementen
const BG_COLOUR = '#231f20';
const FOOD_COLOUR = '#28a745';
const SNAKE_COLOUR = '#7B68EE';

// Frontend mit Backend verknüpfen
const socket = io('https://sleepy-island-33889.herokuapp.com/'); //Heroku App-Domain

//Listen to:
socket.on('gameState', handleGameState);
socket.on('init', handleInit);
socket.on('gameCode', handleGameCode);
socket.on('gameOver', handleGameOver);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('unknownCode', handleUnknownCode);


// Elemente aufrufen von Index HTML
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

//Neues Spiel Funktion & initialisierung
function newGame() {
  socket.emit('newGame');
  init();
}

//Spiel Beitreten Fuktion & initialisierung
function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}

//Globale Elemete initialisieren
let canvas, ctx;
let playerNumber;
let gameActive = false;

//HTML Screen ausblenden & Gamescreen einblenden
function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

// Spielfarben & Maßeinheiten (Funktion)
function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  //Elemente mit Farbe ausfüllen
  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  //Spieler darstellen
  paintPlayer(state.players[0], size, SNAKE_COLOUR);
  paintPlayer(state.players[1], size, '#ff0000');
}

function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;

  //Win - Loose Nachricht anzeigen
  if (data.winner === playerNumber) {
    alert('You Win!');
  } else {
    alert('You Lose :(');
  }
}

//Raum-Code anzeigen
function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

//Mögliche Fehlercodes
function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}

function handleTooManyPlayers() {
  reset();
  alert('This game is already in progress');
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}
