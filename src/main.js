const Phaser = require("phaser");

const FOOD_COUNT = 100;
const SCALE_FACTOR = 0.01;
const EDIBLE_RADIUS_DIFFERENCE = 10;
const RADIUS_EDIBILITY_MODIFIER = 1.6;

const { ClientNetwork } = require("./backend/network");

module.exports = function (network) {
    class MainGame extends Phaser.Scene {
        constructor()
        {
            super({key: "Main Game"});
            this.velocity = { x: 0, y: 0 };
            this.state = {};
            this.players = {};
            this.food = [];
            this.init = false;
        }

        preload() {
            
        }

        create() {
            console.log("create");
            let centre = new Phaser.Math.Vector2(this.cameras.main.centerX, this.cameras.main.centerY);

            //this.circle = this.add.circle(centre.x + 100, centre.y, 30, "0xff0000");
            //this.circle.name = "player";   
            
            //this.add.circle(centre.x + 100, centre.y, 10, "0x00ff00");

            //this.physics.add.existing(this.circle);

            //this.cameras.main.startFollow(this.circle);

            this.input.on('pointermove', (e) => {
                this.velocity = (new Phaser.Math.Vector2(e.x, e.y)).subtract(centre);
            });

            //this.physics.add.collider(this.circle, this.reference);

            /*this.physics.add.overlap(this.circle, this.enemy, function(body1, body2) {
                let foodObject = body1.name === "player" ? body2 : body1;

                let r = this.circle.radius * this.circle.scale;
                let targetR = foodObject.radius * foodObject.scale;
                let dr = (r + targetR);

                console.log(this.circle.body.position.distanceSq(foodObject.body.position));

                if (this.circle.body.position.distanceSq(foodObject.body.position) < dr*dr && Math.abs(r - targetR) >= EDIBLE_RADIUS_DIFFERENCE) {
                    if (targetR > r) {
                        alert("EATEN");
                    } else {
                        this.circle.scale += (foodObject.scale * 0.01);

                        foodObject.destroy();
                    }
                }
            }, null, this);*/
        }

        collision(circle1, circle2) {
            let dx = circle1.x - circle2.x;
            let dy = circle1.y - circle2.y;
            let r = circle1.radius + circle2.radius;

            return (dx*dx + dy*dy) < r*r;
        }

        update() {
            //this.circle.body.setVelocity(this.velocity.x, this.velocity.y);
            if (network instanceof ClientNetwork) {
                if (this.players[this.state.id]) {
                    network.queue({ cmd: "SET_VELOCITY", velocity: this.velocity });
                }
                network.flush();
                network.update();

                //console.log(network.received);

                while (network.received.length) {
                    let msg = network.received.shift();
                    //console.log(msg);

                    if (msg.cmd === "STATE") {
                        let { food, players } = msg.state;
                        this.state = msg.state;
                        //console.log(msg);

                        for (let f of food) {
                            const { x, y, colour, radius } = f;
                            let obj = this.add.circle(x, y, radius, colour);

                            this.physics.add.existing(obj);

                            this.food.push(obj);
                        }

                        for (let p of Object.keys(players)) {
                            const { x, y, colour, radius } = players[p];
                            let obj = this.add.circle(x, y, radius, colour);

                            this.physics.add.existing(obj);

                            this.players[p] = obj;
                        }

                        this.cameras.main.startFollow(this.players[this.state.id]);
                        this.init = true;
                    } else if (this.init) {
                        if (msg.cmd === "UPDATE") {
                            let { player } = msg;
                            this.state.players[player.id] = player;
                            //console.log(this.players[player.id]);
                            this.players[player.id].setPosition(player.x, player.y);
                        } else if (msg.cmd === "DESTROY_FOOD") {
                            let { index } = msg;
                            //console.log(this.players[player.id]);
                            this.food = this.food.filter((f, i) => {
                                if (i === index) {
                                    f.destroy();
                                    return false;
                                }
                                return true;
                            });
                        } else if (msg.cmd === "SET_PLAYER_RADIUS") {
                            let { id, radius } = msg;
                            //this.state.players[id].radius = radius;
                            //console.log(this.players[player.id]);
                            this.players[id].setRadius(radius);
                        } else if (msg.cmd === "DESTROY_PLAYER") {
                            let { id } = msg;
                            console.log(id);
                            console.log(msg);
                            this.players[id].destroy();
                            delete this.players[id];
                            delete this.state.players[id];
                        } else if (msg.cmd === "CREATE_FOOD") {
                            const { x, y, radius, colour } = msg;
                            let obj = this.add.circle(x, y, radius, colour);

                            this.physics.add.existing(obj);

                            this.food.push(obj);
                        } else if (msg.cmd === "CREATE_PLAYER") {
                            const { id, x, y, radius, colour } = msg.player;

                            if (this.players[id])
                                continue;

                            let obj = this.add.circle(x, y, radius, colour);

                            this.physics.add.existing(obj);

                            this.players[id] = obj; 
                        }
                    }
                }
            } else {
                
            }
            //this.circle.body.setVelocity(this.velocity.x, this.velocity.y);
            this.children.list.forEach(c => {
                c.setDepth(c.radius * c.scale);
            });
        }
    }

    return MainGame;
}