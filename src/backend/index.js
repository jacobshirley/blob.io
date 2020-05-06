const express = require("express");
const app = express();

const STANDARD_CONFIG = require("../config/standard.server.config.js");
const ServerGame = require("./game.js");
const { ServerNetwork } = require("./network");

app.use(express.static("public"));

const server = app.listen(process.env.PORT || 80, () => console.log("Server started! Visit http://localhost to play the game!"));

const net = new ServerNetwork(server);
let game = new ServerGame(net);
game.preload();
game.create();

const FREQ = 1000 / 60;

setInterval(() => {
  game.update();
}, FREQ);

module.exports = server;