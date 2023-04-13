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

// Create the express app
const express = require("express");
const app = express();
app.use(express.json());

// Mount the collections and fly trap
users.mount(app);
test.mount(app);
FlyTrap.for_app(app, OPTS_DEV);

// Attach the express app to an http server
const server = require("http").createServer();
server.on("request", app);
server.listen(5000, () => console.log("Listening"));
