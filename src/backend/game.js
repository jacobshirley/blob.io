
const FOOD_COUNT = 100;
const SCALE_FACTOR = 0.01;
const EDIBLE_RADIUS_DIFFERENCE = 10;
const RADIUS_EDIBILITY_MODIFIER = 1.1;
const PLAYER_RADIUS = 50;

const MAX_VEL_X = 10;
const MAX_VEL_Y = 10;

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '0x';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

module.exports = class ServerGame {
    constructor(width, height, net)
    {
        this.velocity = { x: 0, y: 0 };
        this.circles = [];
        this.state = {
            food: [],
            players: {}
        }
        this.net = net;
        this.w = width;
        this.h = height;

        this.centre = { 
            x: width / 2,
            y: height / 2
        }
    }

    preload() {
        
    }

    randPoint() {
        return {
            x: this.centre.x - (-this.centre.x + (Math.random() * this.w)), 
            y: this.centre.y - (-this.centre.y + (Math.random() * this.h))
        }
    }

    createFood(count = FOOD_COUNT, queueNet) {
        for (let i = 0; i < count; i++) {
            let obj = {
                ...this.randPoint(),
                radius: 10, 
                colour: "0x00ff00"
            };

            this.state.food.push(obj);

            if (queueNet) {
                this.net.queue({ cmd: "CREATE_FOOD", ...obj});
            }  
        }
    }

    create() {
        this.createFood();

        this.net.on("connection", ws => {
            this.state.players[ws.id] = {
                ...this.randPoint(),
                id: ws.id,
                radius: PLAYER_RADIUS,
                colour: getRandomColor()
            }
            
            this.net.queue({cmd: "STATE", state: { ...this.state, id: ws.id }}, ws);
            this.net.queue({cmd: "CREATE_PLAYER", player: this.state.players[ws.id]});
        });

        this.net.on("disconnection", ws => {
            delete this.state.players[ws.id];
            console.log("DISCONNECTED");

            this.net.queue({cmd: "DESTROY_PLAYER", id: ws.id });
        });
    }

    collision(circle1, circle2) {
        let dx = circle1.x - circle2.x;
        let dy = circle1.y - circle2.y;
        let r = circle1.radius + circle2.radius;

        return (dx*dx + dy*dy) < r*r;
    }

    update() {
        this.net.update();

        while (this.net.received.length) {
            let { client, messages } = this.net.received.shift();

            for (let m of messages) {
                if (m.cmd === "SET_VELOCITY") {
                    let p = this.state.players[client.id];

                    if (!p)
                        continue;

                    p.x += Math.min(m.velocity.x / 100, MAX_VEL_X);
                    p.y += Math.min(m.velocity.y / 100, MAX_VEL_Y);
    
                    this.net.queue({ cmd: "UPDATE", id: client.id, player: p });
                }
            }

            //console.log(message);
        }

        let removed = 0;
        this.state.food = this.state.food.filter((obj, index) => {
            for (let pId of Object.keys(this.state.players)) {
                let p = this.state.players[pId];

                let r = p.radius;
                let targetR = obj.radius;
                let dr = (r - targetR) * RADIUS_EDIBILITY_MODIFIER;
                let dx = p.x - obj.x;
                let dy = p.y - obj.y;

                //console.log(dx, dy);

                if ((dx*dx) + (dy*dy) < dr*dr) {
                    p.radius += obj.radius * SCALE_FACTOR;

                    //console.log("DESTROY");
                    this.net.queue({ cmd: "DESTROY_FOOD", index: index - removed++ });
                    this.net.queue({ cmd: "SET_PLAYER_RADIUS", id: pId, radius: p.radius });

                    return false;
                }
            }
            
            return true;
        });

        this.createFood(removed, true);

        let playersToBeRemoved = {};
        for (let pId of Object.keys(this.state.players)) {
            for (let pId2 of Object.keys(this.state.players)) {
                if (pId === pId2)
                    continue;

                let p = this.state.players[pId];
                let p2 = this.state.players[pId2];

                let r = p.radius;
                let targetR = p2.radius;
                let dr = (r - targetR) * RADIUS_EDIBILITY_MODIFIER;
                let dx = p.x - p2.x;
                let dy = p.y - p2.y;

                let winner = p.radius > p2.radius ? p : p2;
                let loser = p.radius > p2.radius ? p2 : p;

                //console.log(dx, dy);

                if (!playersToBeRemoved[loser.id] && (dx*dx) + (dy*dy) < dr*dr/* && Math.abs(r - targetR) >= EDIBLE_RADIUS_DIFFERENCE*/) {
                    winner.radius += loser.radius * SCALE_FACTOR;

                    playersToBeRemoved[loser.id] = true;
                    //console.log("DESTROY");
                    this.net.queue({ cmd: "DESTROY_PLAYER", id: loser.id });
                    this.net.queue({ cmd: "SET_PLAYER_RADIUS", id: winner.id, radius: winner.radius });
                }
            }
        }

        Object.keys(playersToBeRemoved).forEach(p => {
            delete this.state.players[p];
        })

        this.net.flush();
    }
}

//console.log(game);