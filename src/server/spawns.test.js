const ServerGame = require("./game.js")

test("Player Spawns", () => {
    let game = new ServerGame();
    game.state.players = {
        "id": {
            x: 10,
            y: 10,
            radius: 10
        }
    }
    expect(game.inPlayerRadius({
        x: 5,
        y: 5
    })).toBeTruthy();
})