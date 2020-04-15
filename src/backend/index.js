const express = require("express");
const app = express();
const WebSocket = require("ws");
const { ServerNetwork } = require("./network");

const { JSDOM } = require('jsdom')

const { window } = new JSDOM("", {
  url: "http://localhost"
});

//global = { ...window, window };

window.focus = () => {};

global.window = window;
global.performance = window.performance;
global.navigator = window.navigator;
global.document = window.document;
global.Element = window.Element;
global.Image = window.Image;
//global = { window, ...window }

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