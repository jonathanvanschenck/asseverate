![Asseverate Logo](./assests/logo.svg)
# Asseverate
A no-dependency, object-oriented, flexible, API framework compatible with all your favorite protocols!

Following the flavor of express.js, this API framework allows you to write your API routes
with minimal boiler-plate. Asseverate doesn't assume you are using express as your communication protocol,
including binding for `socket.io` (websockets) and `rest-over-sockets` (native-sockets). This lets your
write your controllers and collections for your REST endpoints without having to worry about where the
requests are actually coming from.

>
> Write one, deploy everywhere
>


## Installation
```bash
npm install asseverate
```

## Basic usage
Check out the [examples](./examples) for more details

### Simple Routing
Just extend the `Controller` class to create a new route:
```js
const { Controller } = require("asseverate");

class GetTest extends Controller {
    static path = "/api/test";

    // Send a response, auto JSON stringified
    async response() {
        return { ok: true };
    }
}

// Mount to an express server:
const express = require("express");
const app = express();

app.use(GetTest.path, new GetTest()); // or more concisely: GetTest.for_app(app);


// On the client...
await fetch("http://localhost:5000/api/test").then(r => r.json()); // { ok:true }
```
### Collections
If several routes all exist under the same namespace, use a `Collection` to keep them
organized:
```js
const { Controller, Collection, HTTPCodeError } = require("asseverate");

class GetUsers extends Controller {
    static path = "/users"; // <======   Relative path

    async response() {
        return [{ id: 1 }, { id:2 }];
    }
}

class GetUser extends Controller {
    static path = "/user:/id"; // <======   Relative path

    async parse_request(req) { // actual express.Request object
        const id = parseInt(req.params?.id);
        if ( isNaN(id) ) throw HTTPCodeError.standard(404); // sends a 404 to client automatically
        return { id };
    }

    async response({ id }) { // returned by the `parse_request()` method
        return { id: id };
    }
}

class UsersCollection extends Collection {
    static prefix = "/api/users"; // <====== prepends to all routes
    static controllers = [
        GetUsers, GetUser
    ];
}


// Mount to an express server:
const express = require("express");
const app = express();

const users_collection = new UsersCollection();
users_collection.mount(app);
// Or more concisely: UsersCollection.for_app(app);

// On the client...
await fetch("http://localhost:5000/api/users/users").then(r => r.json()); // [{ id:1 }, { id:2 }]
await fetch("http://localhost:5000/api/users/user/1").then(r => r.json()); // { id:1 }
await fetch("http://localhost:5000/api/users/user/bad").then(r => r.status); // 404
```

## Future Features
  - Auto-generated openapi spec
