//Import von constants.js
const { GRID_SIZE } = require('./constants');

//Export von Modulen
module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
}

//Zufallspawn für Essen initialisieren, nach jeder neuen Instanz
function initGame() {
  const state = createGameState()
  randomFood(state);
  return state;
}

//Startvariabeln
function createGameState() {
  return {
    //Spieler1 Posiition
    players: [{
      pos: {
        x: 5,
        y: 10,
      },
      ////Spieler1 Beschleunigung
      vel: {
        x: 1, //0
        y: 0,
      },
      //Spieler1 Schlangenlänge
      snake: [
        {x: 1, y: 10},
        {x: 2, y: 10},
        {x: 3, y: 10},
        {x: 4, y: 10},
        {x: 5, y: 10},
      ],
    }, {
      //Spieler2 Posiition
      pos: {
        x: 16,
        y: 10,
      },
      //Spieler2 Posiition
      vel: {
        x: 1, //0
        y: 0,
      },
      //Spieler2 Schlangenlänge
      snake: [
        {x: 20, y: 10},
        {x: 19, y: 10},
        {x: 18, y: 10},
        {x: 17, y: 10},
        {x: 16, y: 10},
      ],
    }],
    food: {},
    gridsize: GRID_SIZE,
  };
}

//Gameloop für Zwei Spieler
function gameLoop(state) {
  if (!state) {
    return;
  }

  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  //Aktualisierung der Position
  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;

  playerTwo.pos.x += playerTwo.vel.x;
  playerTwo.pos.y += playerTwo.vel.y;

  //Win-Loss when out of Map
  if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
    return 2; //Spieler 2 gewinnt
  }

  if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
    return 1; //Spieler 1 gewinnt
  }
  // //Win-Loss on Snake - Snake collission
  // if (playerOne.pos.x == playerTwo.cell  && playerOne.pos.y == playerTwo.cell) {
  //   return 2; //Spieler 2 gewinnt
  // } 

  // if (playerTwo.pos.x == playerOne.cell  && playerTwo.snake.y == playerOne.cell) {
  //   return 1; //Spieler 1 gewinnt
  // }

  //Größer werden beim Essen
  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;
    randomFood(state);
  }

  if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;
    randomFood(state);
  }

  //Schlangenkörper nach vorne aktualisieren nach dem Essen & Zusammenstoß mit eigenem Körper
  if (playerOne.vel.x || playerOne.vel.y) {
    for (let cell of playerOne.snake) {
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        // Gewinner Spieler 2
        return 2;
      }
    }

    playerOne.snake.push({ ...playerOne.pos });     //Schlangenkörper +1
    playerOne.snake.shift();          //Schlangenkörper -1  
  }
  

  if (playerTwo.vel.x || playerTwo.vel.y) {
    for (let cell of playerTwo.snake) {
      if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
        //Gewinner Spieler 1
        return 1;
      }
    }

    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snake.shift();
  }

  //Noch kein Gewinner
  return false;
}

//Essen Zufall-Spawn
function randomFood(state) {
  food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  }

  //Essen nicht im Schlangenkörper spawnen
  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  for (let cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  state.food = food;
}

//Richtungstasten 
function getUpdatedVelocity(keyCode) {
  switch (keyCode) {
    case 37: { // links
      return { x: -1, y: 0 };
    }
    case 38: { // unten
      return { x: 0, y: -1 };
    }
    case 39: { // rechts
      return { x: 1, y: 0 };
    }
    case 40: { // oben
      return { x: 0, y: 1 };
    }
  }
}
