const HEADER_TEXT = {font:"24px Arial"};
const ITEM_TEXT = {font:"16px Arial"};

const MENU_ITEMS = {
    "restart": {
        label: "Restart",
        loadScene: "menu",
    }
}

module.exports = class Loss extends Phaser.Scene {
    constructor() {
        super({key: "loss"});
    }

    preload() {

    }

    create() {
        let cx = this.game.renderer.width / 2;
        let cy = this.game.renderer.height / 3.5;

        this.add.rectangle(cx, cy + 50, 300, 200, "0x1a1a1a");

        this.add.text(cx, cy, "Oh no! You were eaten!", HEADER_TEXT).setOrigin(0.5);

        cy += 10;

        Object.keys(MENU_ITEMS).forEach((val, i) => {
            this[val] = this.add.text(cx, cy + 40 + (i * 20), MENU_ITEMS[val].label, ITEM_TEXT).setOrigin(0.5);

            this[val].setInteractive();
            this[val].on('pointerover', (pointer) => {
                this[val].style.color = "#ff0000";
                this[val].updateText();
            });

            this[val].on('pointerout', (pointer) => {
                this[val].style.color = "#ffffff";
                this[val].updateText();
            });

            this[val].on('pointerdown', pointer => {
                console.log("HIII");
                this.scene.stop("main_game");
                this.scene.stop("hud");
                this.scene.start(MENU_ITEMS[val].loadScene);
            });
        });
    }

    update() {

    }
}