const Phaser = require("phaser");

const clientConfig = require("./config/standard.client.config");

const MainGame = require("./main.js");
const Choose = require("./ui/choose.js");
const HUD = require("./ui/hud.js");
const Loss = require("./ui/loss.js");
const GameMenu = require("./ui/game-menu.js");

let config = {
    autoPlay: false,
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: "100%",
        height: "100%"
    },
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [Choose, MainGame(clientConfig), HUD, Loss, GameMenu],
};

let game = new Phaser.Game(config);

module.exports = game;