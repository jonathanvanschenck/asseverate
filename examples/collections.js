
const { Controller, Middleware, Collection, HTTPCodeError } = require("../index.js");

class GetTest extends Controller {
    static path = "/test";
    static method = "GET";

    async respond() { return { ok:true }; }
}

class Test extends Collection {
    static controllers = [ GetTest ];
}

class Auth extends Middleware {
    async meddle(req) {
        if ( req.get("x-api-key") != "secret" ) throw HTTPCodeError.standard(401);
    }
}

class GetUsers extends Controller {
    static path = "/users";
    static method = "GET";

    async respond(request) {
        return [{ id:1 }, { id:2 }];
    }
}
class PostUser extends Controller {
    static path = "/users";
    static method = "POST";
    async parse_request(req) {
        const id = parseInt(req.body.id);
        if ( isNaN(id) ) throw new HTTPCodeError(400, "Bad parameter id: "+req.body.id);
        return {
            id
        };
    }
    async respond({ id }) {
        return { id };
    }
}
class GetUser extends Controller {
    static path = "/user/:id";
    static method = "GET";

    async parse_request(req) {
        const id = parseInt(req.params.id);
        if ( isNaN(id) ) throw HTTPCodeError.standard(404);
        return {
            id
        };
    }
    async respond({ id }) {
        return { id };
    }
}

class Users extends Collection {
    static prefix = "/users";
    static middlewares = [ Auth ];
    static controllers = [ GetUsers, PostUser, GetUser ];
}

module.exports = { Users, Test };
