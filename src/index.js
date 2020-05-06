const Phaser = require("phaser");

const clientConfig = require("./config/standard.client.config");

const MainGame = require("./main.js");
const Menu = require("./ui/menu.js");
const HUD = require("./ui/hud.js");

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
    scene: [Menu, MainGame(clientConfig), HUD],
};

let game = new Phaser.Game(config);

module.exports = game;