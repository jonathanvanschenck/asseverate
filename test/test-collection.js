const expect = require("chai").expect; // eslint-disable-line node/no-unpublished-require

const { App, Request } = require("./spoof.js");
const { Controller, Middleware, Collection, HTTPCodeError } = require("../index.js");

const OPTS_DEV = {
    dev:true,
    log:null,
    penalty_ms:0,
};

// SETUP
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

    async respond() {
        return [{ id:1 }, { id:2 }];
    }
}
class PostUser extends Controller {
    static path = "/users";
    static method = "POST";
    async parse_request(req) {
        const id = parseInt(req.body.id);
        if ( isNaN(id) ) throw new HTTPCodeError(400, "Bad parameter id"+req.body.id);
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

const app = new App();
const test = Test.for_app(app, OPTS_DEV);
const users = Users.for_app(app, OPTS_DEV);

test.mount(app);
users.mount(app);

/* eslint-disable no-unused-vars */
describe("Collection", function() {
    describe("Test routes", function() {
        it("Can GET", async function() {
            const res = await app.handle("GET", "/test", new Request());

            expect(res).to.be.an("object");
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an("object");
            expect(res.body.ok).to.equal(true);
        });
        it("404", async function() {
            const res = await app.handle("GET", "/test/wrong", new Request());

            expect(res).to.be.an("object");
            expect(res.statusCode).to.equal(null);
        });
    });
    describe("User routes", function() {
        it("404 - bad url", async function() {
            const res = await app.handle("GET", "/users", new Request());
            expect(res).to.be.an("object");
            expect(res.statusCode).to.equal(null);
        });
        it("401", async function() {
            const res = await app.handle("GET", "/users/users", new Request());

            expect(res).to.be.an("object");
            expect(res.statusCode).to.equal(401);
        });
        it("GET users", async function() {
            const res = await app.handle("GET", "/users/users", new Request({ headers: { "X-API-KEY": "secret" }}));

            expect(res).to.be.an("object");
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an("array");
        });
        it("404 - GET user bad id", async function() {
            const res = await app.handle("GET", "/users/user/bad", new Request({ headers: { "X-API-KEY": "secret" }}));

            expect(res).to.be.an("object");
            expect(res.statusCode).to.equal(404);
        });
        it("GET user", async function() {
            const res = await app.handle("GET", "/users/user/1", new Request({ headers: { "X-API-KEY": "secret" }}));

            expect(res).to.be.an("object");
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an("object");
            expect(res.body.id).to.equal(1);
        });
        it("POST users", async function() {
            const res = await app.handle("POST", "/users/users", new Request({ body: { id:10 }, headers: { "X-API-KEY": "secret" }}));

            expect(res).to.be.an("object");
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an("object");
            expect(res.body.id).to.equal(10);
        });
        it("400 - POST users bad id", async function() {
            const res = await app.handle("POST", "/users/users", new Request({ body: { id:"bad" }, headers: { "X-API-KEY": "secret" }}));

            expect(res).to.be.an("object");
            expect(res.statusCode).to.equal(400);
        });
    });
});
/* eslint-enable no-unused-vars */
