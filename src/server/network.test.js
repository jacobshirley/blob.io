const server = require("./index.js");
const WebSocket = require("ws");
const { ClientNetwork } = require("./network");

test("WebSocket conection", done => {
    let net = new ClientNetwork();
    net.on("message", (m) => {
        console.log(m);
        done();
        net.close();
    });
    //console.log(client);
});

afterAll(() => {
    server.close();
});