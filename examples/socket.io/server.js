const { Handler, HTTPCodeError } = require("../../index.js");
const { Users, Test } = require("../collections.js");
const OPTS_DEV = {
    dev:true,
    log:null,
    penalty_ms:0,
};

const users = new Users(OPTS_DEV);
const test = new Test(OPTS_DEV);

// Add a generic 404 for any stray requests
class FlyTrap extends Handler {
    static path = "/";
    async handle() { throw HTTPCodeError.standard(404); }
}

// create the http server
const server = require("http").createServer();
server.listen(5000, () => console.log("Listening"));

// Create the socket.io server
const { Server:IOServer } = require("socket.io");
const io = new IOServer(server);
const { ROSApp } = require("rest-over-sockets");
const app = new ROSApp();

// Mount the collections and fly trap
users.mount(app);
test.mount(app);
FlyTrap.for_app(app, OPTS_DEV);

// Set up the server
io.on("connection", (sock) => {
    sock.on("ROSRequest", (msg, callback) => {
        app.receive(msg, callback);
    });
});

