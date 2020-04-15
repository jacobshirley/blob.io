const express = require("express");
const app = express();
const { ServerNetwork } = require("./network");

const MultiplayerGame = require("./game.js");

app.use(express.static("public"));

const server = app.listen(process.env.PORT || 80, () => console.log("Server started! Visit http://localhost to play the game!"));

const net = new ServerNetwork(server);
let game = new MultiplayerGame(1000, 1000, net);
game.preload();
game.create();

const FREQ = 1000 / 60;

setInterval(() => {
  game.update();
}, FREQ);

module.exports = server;