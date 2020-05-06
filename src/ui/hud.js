const HEADER_TEXT = {font:"24px Arial"};
const ITEM_TEXT = {font:"16px Arial"};

module.exports = class HUD extends Phaser.Scene {
    constructor() {
        super({key: "hud"});
        this.playersCache = {};
    }

    preload() {
        
    }

    create(data) {
        this.playerScoreboard = [];

        let x = this.game.renderer.width - 200;
        let y = 10;
        this.add.text(x, y, "Scoreboard", HEADER_TEXT);

        this.scoreText = this.add.text(20, this.game.renderer.height - 50, "Size: ", HEADER_TEXT);
    }

    getRadiiOfPlayers() {
        let players = this.registry.get("players") || {};
        return Object.keys(players).map(p => ({name: players[p].name, radius: Math.round(players[p].radius)}));
    }

    update() {
        let players = this.registry.get("players") || {};
        let myPlayerId = this.registry.get("myPlayerId");
        let radii = this.getRadiiOfPlayers();

        if (typeof myPlayerId !== "undefined")
            this.scoreText.setText("Score: " + Math.round(players[myPlayerId].radius));

        if (JSON.stringify(radii) != JSON.stringify(this.playersCache)) {
            this.playersCache = radii;

            radii.sort((a, b) => a.radius - b.radius);

            this.playerScoreboard.forEach(e => {
                e.destroy();
            });

            this.playerScoreboard = [];

            let x = this.game.renderer.width - 200;
            let y = 10;

            for (let [i, p] of radii.entries()) {
                this.playerScoreboard.push(this.add.text(x, y + 50 + (i * 30), (p.name || "[no name]") + ": " + Math.round(p.radius)));
            }
        }
    }
}