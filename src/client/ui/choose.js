const HEADER_TEXT = {font:"24px Arial"};
const ITEM_TEXT = {font:"16px Arial"};

const MENU_ITEMS = {
    "resume": "Resume",
    "volumeToggle": "Toggle sound",
}

const BALL_TYPES = [
    {
        colour: "0xff0000",
        label: "Red"
    },
    {
        colour: "0x00ff00",
        label: "Green"
    },
    {
        colour: "0x0000ff",
        label: "Blue"
    },
    {
        colour: "0xff00ff",
        label: "Purple"
    },
    {
        colour: "0xffff00",
        label: "Yellow"
    },
    {
        colour: "0x00ffff",
        label: "Cyan"
    }
]

module.exports = class Choose extends Phaser.Scene {
    constructor() {
        super({key: "menu"});
    }

    preload() {
        BALL_TYPES.filter(x => x.image).forEach(bt => {
            this.load.image(bt.key, bt.image);
        });

        this.load.html("name_box", "assets/html/name_box.html");
    }

    create() {
        let cx = this.game.renderer.width / 2;
        let cy = this.game.renderer.height / 3.5;

        this.add.rectangle(cx, cy + 150, 300, 400, "0x1a1a1a");

        let nameInput = this.add.dom(cx, cy).createFromCache("name_box");
        nameInput.on("keyup", e => {
            console.log(e.target.value);
        });

        cy += 50;

        this.add.text(cx, cy, "Choose a blob", HEADER_TEXT).setOrigin(0.5);


        let midX = cx - 100;

        for (let [i, bt] of BALL_TYPES.entries()) {
            let c = this.add.circle(midX + (100 * (i % 3)), cy + 100 + (100 * Math.floor(i / 3)), 50, bt.colour);

            c.setInteractive();
            c.on('pointerover', (pointer) => {
                c.underline = this.add.rectangle(c.x, c.y + 50, 100, 10, "0xffffff");
            });

            c.on('pointerout', (pointer) => {
                c.underline.destroy();
            });

            c.on("pointerdown", pointer => {
                this.scene.start("main_game", { 
                    colour: c.fillColor, 
                    name: document.getElementById("name").value
                });
            });
        }

        /*cy += 100;

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
        });*/
    }

    update() {

    }
}