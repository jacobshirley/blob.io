
const STANDARD_CONFIG = require("../config/standard.server.config.js");

const randomName = require("random-name");

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '0x';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

module.exports = class ServerGame {
    constructor(net, config = STANDARD_CONFIG) {
        this.velocity = { x: 0, y: 0 };
        this.config = config;
        this.circles = [];
        this.state = {
            food: [],
            players: {},
            projectiles: []
        }
        this.net = net;
        this.w = config.WIDTH;
        this.h = config.HEIGHT;

        this.centre = { 
            x: this.w / 2,
            y: this.h / 2
        }

        this.currentMass = 0;
    }

    preload() {
        
    }

    spawnFood(queueNet) {
        //console.log(this.currentMass);
        let count = (this.config.MAX_WORLD_MASS - this.currentMass) / this.config.FOOD_RADIUS;
        //console.log(this.config.MAX_WORLD_MASS, this.currentMass);
        for (let i = 0; i < count; i++) {
            let obj = {
                ...this.randomPoint(),
                radius: this.config.FOOD_RADIUS, 
                colour: this.config.FOOD_COLOURS[Math.floor(Math.random() * this.config.FOOD_COLOURS.length)]
            };

            this.state.food.push(obj);

            if (queueNet)
                this.net.queue({ cmd: "CREATE_FOOD", ...obj});
            this.currentMass += obj.radius;
        }
    }

    randomPoint() {
        return {
            x: this.centre.x - (-this.centre.x + (Math.random() * this.w)), 
            y: this.centre.y - (-this.centre.y + (Math.random() * this.h))
        }
    }
    
    randomPointPlayerCheck(extraDistance) {
        let rand = this.randomPoint();
        if (this.inPlayerRadius(rand, extraDistance)) {
            return this.randomPointPlayerCheck(extraDistance);
        }
    
        return rand;
    }
    
    inPlayerRadius(point, extraDistance = 0) {
        for (let p of Object.keys(this.state.players)) {
            let player = this.state.players[p];
            let dx = player.x - point.x;
            let dy = player.y - point.y;
            let r = player.radius + extraDistance;
            if ((dx*dx) + (dy*dy) <= r*r) {
                return true;
            }
        }
        return false;
    }

    create() {
        this.spawnFood(false);

        this.net.on("connection", ws => {            
            
        });

        this.net.on("disconnection", ws => {
            let p = this.state.players[ws.id];
            if (p) {
                this.currentMass -= p.radius;
                this.createProjectile(p, {x: 0, y: 0}, 0, p.radius);

                this.net.queue({cmd: "DESTROY_PLAYER", id: ws.id });

                delete this.state.players[ws.id];
            }
        });
    }

    checkCollision(obj) {
        if (obj.x < 0) {
            obj.x = 0;
        }

        if (obj.y < 0) {
            obj.y = 0;
        }

        if (obj.x > this.w) {
            obj.x = this.w;
        }

        if (obj.y > this.h) {
            obj.y = this.h;
        }
    }

    createProjectile(player, direction, speed, radius) {
        let vel = {
            x: direction.x * speed,
            y: direction.y * speed
        }

        let projectile = {
            x: player.x + (direction.x * player.radius),
            y: player.y + (direction.y * player.radius),
            colour: player.colour,
            radius,
            vel,
            vec: direction,
            shooter: player.id
        }

        this.state.projectiles.push(projectile);

        this.net.queue({ cmd: "SPAWN_PROJECTILE", ...projectile });

        return projectile;
    }

    update() {
        this.net.update();

        //handle incoming messages from clients
        while (this.net.received.length) {
            let { client, messages } = this.net.received.shift();

            for (let m of messages) {
                if (m.cmd === "SPAWN") {
                    if (this.state.players[client.id])
                        continue;

                    this.state.players[client.id] = {
                        ...this.randomPointPlayerCheck(100),
                        id: client.id,
                        radius: this.config.PLAYER_RADIUS,
                        colour: m.colour,
                        name: m.name || randomName(),
                        health: 1
                    }

                    this.net.queue({cmd: "STATE", state: { ...this.state, id: client.id }}, client);
                    this.net.queue({cmd: "CREATE_PLAYER", player: this.state.players[client.id]});

                    this.currentMass += this.config.PLAYER_RADIUS;
                } else if (m.cmd === "SET_VELOCITY") {
                    let p = this.state.players[client.id];

                    if (!p)
                        continue;

                    let velX = m.velocity.x / 100;
                    let velY = m.velocity.y / 100;

                    let vel = Math.sqrt((m.velocity.x*m.velocity.x) + (m.velocity.y*m.velocity.y)) / 100;
                    p.vel = {x: velX, y: velY, magnitude: vel};

                    p.x += Math.min(velX, this.config.MAX_VEL_X);
                    p.y += Math.min(velY, this.config.MAX_VEL_Y);

                    if (m.speedBoost) {
                        if (p.radius > this.config.PLAYER_RADIUS) {
                            p.radius -= this.config.SPEED_BOOST_SHRINK_RATE;
                            this.currentMass -= this.config.SPEED_BOOST_SHRINK_RATE;

                            p.x += (velX / vel) * 5;
                            p.y += (velY / vel) * 5;
                        }
                    }

                    this.checkCollision(p);
    
                    this.net.queue({ cmd: "UPDATE", id: client.id, player: p });
                } else if (m.cmd === "SHOOT") {
                    let p = this.state.players[client.id];

                    if (p.radius <= this.config.PLAYER_RADIUS + 5)
                        continue;

                    let vec = {
                        x: p.vel.x / p.vel.magnitude,
                        y: p.vel.y / p.vel.magnitude
                    }

                    let projectile = this.createProjectile(p, vec, this.config.PROJECTILE_VELOCITY, p.radius * this.config.PROJECTILE_PROPORTION_TO_MAIN_BODY);

                    p.radius -= projectile.radius * this.config.SCALE_FACTOR;
                }
            }
        }

        //output messages
        let playersToBeRemoved = {};
        let removed = 0;
        this.state.projectiles = this.state.projectiles.filter((obj, index) => {
            for (let pId of Object.keys(this.state.players)) {
                let vel = Math.sqrt((obj.vel.x*obj.vel.x) + (obj.vel.y*obj.vel.y));
                if (obj.shooter === pId && vel > this.config.PROJECTILE_AUTOPHAGE_SPEED)
                    continue;

                let p = this.state.players[pId];

                let r = p.radius;
                let targetR = obj.radius;
                let dr = (r - targetR) * this.config.RADIUS_EDIBILITY_MODIFIER;
                let dx = p.x - obj.x;
                let dy = p.y - obj.y;

                //console.log(dx, dy);

                if ((dx*dx) + (dy*dy) < dr*dr) {
                    p.radius += obj.radius * this.config.SCALE_FACTOR;
                    p.health -= (obj.radius / p.radius) * this.config.CONSUMPTION_SCALE;

                    if (p.health <= 0)
                        playersToBeRemoved[p.id] = true;

                    //this.currentMass -= obj.radius;
                    //this.currentMass += obj.radius * this.config.SCALE_FACTOR;

                    //console.log("DESTROY");
                    this.net.queue({ cmd: "DESTROY_PROJECTILE", index: index - removed++ });
                    this.net.queue({ cmd: "PLAYER", player: p });

                    return false;
                }
            }
            
            return true;
        });

        removed = 0;
        this.state.food = this.state.food.filter((obj, index) => {
            for (let pId of Object.keys(this.state.players)) {                    
                let p = this.state.players[pId];

                let r = p.radius;
                let targetR = obj.radius;
                let dr = (r - targetR) * this.config.RADIUS_EDIBILITY_MODIFIER;
                let dx = p.x - obj.x;
                let dy = p.y - obj.y;

                //console.log(dx, dy);

                if ((dx*dx) + (dy*dy) < dr*dr) {
                    p.radius += obj.radius * this.config.SCALE_FACTOR;
                    this.currentMass -= obj.radius;
                    this.currentMass += obj.radius * this.config.SCALE_FACTOR;

                    //console.log("DESTROY");
                    this.net.queue({ cmd: "DESTROY_FOOD", index: index - removed++ });
                    this.net.queue({ cmd: "UPDATE", player: p });

                    return false;
                }
            }
            
            return true;
        });

        //this.createFood(removed, true);

        this.spawnFood(true);

        
        for (let pId of Object.keys(this.state.players)) {
            let p = this.state.players[pId];

            for (let pId2 of Object.keys(this.state.players)) {
                if (pId === pId2)
                    continue;
                
                let p2 = this.state.players[pId2];

                let r = p.radius;
                let targetR = p2.radius;
                let dr = (r - targetR) * this.config.RADIUS_EDIBILITY_MODIFIER;
                let dx = p.x - p2.x;
                let dy = p.y - p2.y;

                let winner = p.radius > p2.radius ? p : p2;
                let loser = p.radius > p2.radius ? p2 : p;

                //console.log(dx, dy);

                if (!playersToBeRemoved[loser.id] && (dx*dx) + (dy*dy) < dr*dr && Math.abs(r - targetR) >= this.config.EDIBLE_RADIUS_DIFFERENCE) {
                    winner.radius += loser.radius * this.config.SCALE_FACTOR;
                    this.currentMass -= loser.radius;
                    this.currentMass += loser.radius * this.config.SCALE_FACTOR;

                    playersToBeRemoved[loser.id] = {
                        cause: winner.id
                    };
                    //console.log("DESTROY");
                    this.net.queue({ cmd: "UPDATE", player: winner });
                }
            }
        }

        Object.keys(playersToBeRemoved).forEach(p => {
            let info = playersToBeRemoved[p];
            let player = this.state.players[p];

            const EXPLOSION_PIECES = 7;
            if (player.health <= 0) {
                for (let i = 1; i <= 2 * Math.PI; i += (2 * Math.PI) / EXPLOSION_PIECES)
                    this.createProjectile(player, {x: Math.cos(i), y: Math.sin(i)}, 20, player.radius / EXPLOSION_PIECES);
            }
            delete this.state.players[p];
            this.net.queue({ cmd: "DESTROY_PLAYER", id: player.id, cause: info.cause });
        });

        for (let pId of Object.keys(this.state.players)) {
            let p = this.state.players[pId];

            if (p.radius > this.config.PLAYER_RADIUS) {
                p.radius *= this.config.SHRINK_RATE;
            }

            p.health += this.config.CONSUMPTION_DECREASE;

            if (p.health > 1)
                p.health = 1;

            this.net.queue({ cmd: "UPDATE", player: p });
        }

        let i = 0;
        for (let p of this.state.projectiles) {
            p.x += p.vel.x;
            p.y += p.vel.y;

            p.vel.x *= this.config.PROJECTILE_DECELERATION;
            p.vel.y *= this.config.PROJECTILE_DECELERATION;

            this.checkCollision(p);

            this.net.queue({ cmd: "UPDATE_PROJECTILE", i: i++, projectile: p });
        }

        this.net.queue({ cmd: "CURRENT_WORLD_MASS", mass: this.currentMass });


        this.net.flush();
    }
}

//console.log(game);