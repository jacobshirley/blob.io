const EventEmitter = require('events');

class ClientNetwork extends EventEmitter {
    constructor(isServer = false) {
        super();

        this.isServer = isServer;

        this.socket = new window.WebSocket("ws://" + window.location.hostname);
        this.socket.onmessage = m => {
            let json = JSON.parse(m.data);

            this._receivedBuffer = this._receivedBuffer.concat(json);
            this.emit('message', json);
        }
        this._receivedBuffer = [];
        this.received = [];
        this.packets = [];
    }

    queue(packet) {
        this.packets.push(packet);
    }

    flush() {
        if (this.socket.readyState !== window.WebSocket.OPEN)
            return;

        this.socket.send(JSON.stringify(this.packets));
        this.packets = [];
    }

    update() {
        this.received = this._receivedBuffer.splice(0);
        //console.log(this.received);
    }

    close() {
        return this.socket.close();
    }
}

module.exports = ClientNetwork;