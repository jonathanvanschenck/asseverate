
const { io } = require("socket.io-client");
const { ROSClient } = require("rest-over-sockets");

const socket = io("http://localhost:5000/");
const client = ROSClient.socketio(socket);

!async function() {
    await client.get("/test").then(resp => console.log("GET", "/test", { statusCode: resp.statusCode, data: resp.data }));
    await client.get("/test/bad").then(resp => console.log("GET", "/test/bad", { statusCode: resp.statusCode, data: resp.data }));
    await client.get("/users/users").then(resp => console.log("GET (no key)", "/users/users", { statusCode: resp.statusCode, data: resp.data }));
    await client.get("/users/users", { "x-api-key": "secret" }).then(resp => console.log("GET", "/users/users", { statusCode: resp.statusCode, data: resp.data }));
    await client.get("/users/user/1", { "x-api-key": "secret" }).then(resp => console.log("GET", "/users/user/1", { statusCode: resp.statusCode, data: resp.data }));
    await client.get("/users/user/bad", { "x-api-key": "secret" }).then(resp => console.log("GET", "/users/user/bad", { statusCode: resp.statusCode, data: resp.data }));
    await client.post("/users/users", { id:10 }, { "x-api-key": "secret" }).then(resp => console.log("POST", "/users/users", { statusCode: resp.statusCode, data: resp.data }));
    await client.post("/users/users", { id:"bad" }, { "x-api-key": "secret" }).then(resp => console.log("POST (bad id)", "/users/users", { statusCode: resp.statusCode, data: resp.data }));

    process.exit(0);
}();
