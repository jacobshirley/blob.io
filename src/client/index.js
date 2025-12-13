import Phaser from "phaser";
import clientConfig from "../config/standard.client.config.js";
import MainGame from "./main.js";
import Choose from "./ui/choose.js";
import HUD from "./ui/hud.js";
import Loss from "./ui/loss.js";
import GameMenu from "./ui/game-menu.js";

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

export default game;