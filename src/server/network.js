const uuidv4 = require('uuid').v4;

const WebSocket = require("ws");

const EventEmitter = require('events');

class ServerNetwork extends EventEmitter {
    constructor(server) {
        super();

        this.clients = [];
        this.clientMap = {};
        this.wss = new WebSocket.Server({ server });

        this.wss.on('connection', ws => {
            ws.id = uuidv4();

            ws.on('message', message => {
                //console.log('received: %s', message);
                this._buffer.push({ client: ws, messages: JSON.parse(message) });
            });

            ws.on('close', () => {
                this.clients = this.clients.filter(cl => cl.id !== ws.id);
                delete this.clientPackets[ws.id];
                delete this.clientMap[ws.id];

                this.emit("disconnection", ws);
            });

            this.clients.push(ws);
            this.clientPackets[ws.id] = [];
            this.clientMap[ws.id] = this.clients.length;

            this.emit("connection", ws);
        });

        this._buffer = [];
        this.received = [];
        this.packets = [];
        this.clientPackets = {};
    }

    update() {
        this.received = this._buffer.splice(0);
    }

    queue(packet, client) {
        if (client) {
            this.clientPackets[client.id].push(packet);
        } else {
            this.packets.push(packet);
        }
    }

    flush() {
        for (let client of this.clients) {
            if (this.clientPackets[client.id].length) {
                client.send(JSON.stringify(this.clientPackets[client.id]));
            }

            if (this.packets.length)
                client.send(JSON.stringify(this.packets));

            this.clientPackets[client.id] = [];
        }
        this.packets = [];
    }
}



module.exports = ServerNetwork;