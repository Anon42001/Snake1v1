// Importieren von Modulen & Aktiviere Cross-Origin Resource Sharing 
const http = require("http");
const socket_io = require("socket.io");

const httpServer = http.createServer();
const io = new socket_io.Server(httpServer, {
  cors: {
    origin: "https://snake1v1.netlify.app",
//        origin: "http://127.0.0.1:8080",
//        origin: "https://sleepy-island-33889.herokuapp.com/",
//        origin: "https://tranquil-refuge-03880.herokuapp.com/",
   
    
  },
})();

const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');

const state = {};
//Raum ID Such-Tabelle
const clientRooms = {};

io.on('connection', client => {
//Listen to: Einkommende Ereignisse vom Client
  client.on('keydown', handleKeydown);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    } else if (numClients > 1) {
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit('init', 2);
    
    startGameInterval(roomName);
  }

  //Raum-ID erstellen
  function handleNewGame() {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame();

    //Socket IO Client verbindung zu Raum-ID
    client.join(roomName);
    client.number = 1;
    client.emit('init', 1); //Spielernr, sodass Frontend im Blick hat welche Nr. der aktuelle Spieler hat
  }

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);

    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

  //Gewinnen oder Verloren
function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);
    
    if (!winner) {
      emitGameState(roomName, state[roomName])
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Sende dieses Ereignis zu jedem im Raum
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}

//Heroku-Port oder 3000
io.listen(process.env.PORT || 3000);
