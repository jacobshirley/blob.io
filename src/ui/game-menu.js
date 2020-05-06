const HEADER_TEXT = {font:"24px Arial"};
const ITEM_TEXT = {font:"16px Arial"};

const MENU_ITEMS = {
    "resume": "Resume",
    "volumeToggle": "Toggle sound",
}

module.exports = (items => class GameMenu extends Phaser.Scene {
    constructor() {
        super({key: "game_menu"});
    }

    preload() {
    }

    create() {
        let cx = this.game.renderer.width / 2;
        let cy = this.game.renderer.height / 3.5;

        this.add.rectangle(cx, cy + 150, 300, 400, "0x1a1a1a").setOrigin(0);

        cy += 100;

        this.title = this.add.text(cx, cy, "Menu", HEADER_TEXT).setOrigin(0.5);

        Object.keys(MENU_ITEMS).forEach((val, i) => {
            this[val] = this.add.text(cx, cy + 40 + (i * 20), MENU_ITEMS[val], ITEM_TEXT).setOrigin(0.5);

            this[val].setInteractive();
            this[val].on('pointerover', (pointer) => {
                this[val].style.color = "#ff0000";
                this[val].updateText();
            });

            this[val].on('pointerout', (pointer) => {
                this[val].style.color = "#ffffff";
                this[val].updateText();
            });
        });
    }

    update() {

    }
})(MENU_ITEMS);