
const expect = require("chai").expect; // eslint-disable-line node/no-unpublished-require

const { App, Request, Response } = require("./spoof.js");
const { Handler, HTTPCodeError } = require("../index.js");

const OPTS_DEV = {
    dev:true,
    log:null,
    penalty_ms:0,
};
const OPTS_DEP = {
    dev:false,
    log:null,
    penalty_ms:0,
};

/* eslint-disable no-unused-vars */
describe("Handler", function() {
    describe("#send", function() {
        it("200", async function() {
            const h = new Handler(OPTS_DEV);

            const res = new Response();
            await h.send(res, 200, { ok:true });
            expect(res.statusCode).to.equal(200);
            expect(res.headers).to.be.an("object");
            expect(res.headers["content-type"]).to.equal("application/json");
            expect(res.body).to.be.an("object");
            expect(res.body.ok).to.equal(true);
        });
        it("204", async function() {
            const h = new Handler(OPTS_DEV);

            const res = new Response();
            await h.send(res, 204);
            expect(res.statusCode).to.equal(204);
            expect(res.headers).to.be.an("object");
            expect(res.headers["content-type"]).to.equal(undefined);
            expect(res.body).to.equal(null);
        });
    });
    describe("#send_message", function() {
        it("404", async function() {
            const h = new Handler(OPTS_DEV);

            const res = new Response();
            await h.send_message(res, 404, "not found");
            expect(res.statusCode).to.equal(404);
            expect(res.body).to.be.an("object");
            expect(res.body.message).to.equal("not found");
        });
    });
    describe("#call", function() {
        it("executes", async function() {
            const h = new Handler(OPTS_DEV);

            const req = new Request();
            const res = new Response();
            const next = () => {};
            await h(req, res, next); // No errors
        });
        it("Can handle http errors", async function() {
            class H extends Handler {
                async handle() { throw HTTPCodeError.standard(404); }
            }
            const h = new H(OPTS_DEV);

            const req = new Request();
            const res = new Response();
            const next = () => {};
            await h(req, res, next);

            expect(res).to.be.an("object");
            expect(res.statusCode).to.equal(404);
        });
        it("Can handle unexpected errors dev", async function() {
            class H extends Handler {
                async handle() { throw new TypeError("bad type"); }
            }
            const h = new H(OPTS_DEV);

            const req = new Request();
            const res = new Response();
            const next = () => {};
            await h(req, res, next);

            expect(res).to.be.an("object");
            expect(res.statusCode).to.equal(500);
            expect(res.body.type).to.equal("TypeError");
        });
        it("Can handle unexpected errors dep", async function() {
            class H extends Handler {
                async handle() { throw new TypeError("bad type"); }
            }
            const h = new H(OPTS_DEP);

            const req = new Request();
            const res = new Response();
            const next = () => {};
            await h(req, res, next);

            expect(res).to.be.an("object");
            expect(res.statusCode).to.equal(500);
            expect(res.body.message).to.equal("internal error");
        });
    });
    describe("#handle", function() {
        it("Can modify response", async function() {
            class H extends Handler {
                async handle(req, res) { res.extra = "yes"; }
            }
            const h = new H(OPTS_DEV);

            const req = new Request();
            const res = new Response();
            const next = () => {};
            await h(req, res, next);

            expect(res).to.be.an("object");
            expect(res.extra).to.equal("yes");
        });
    });
    describe("#mount", function() {
        it("Can mount", async function() {
            class _H extends Handler {
                async handle(req, res, next) {
                    res.extra = "yes";
                }
            }
            const h = new _H(OPTS_DEV);

            const app = new App();

            h.mount(app);

            const res = await app.handle("GET", "/", new Request());

            expect(res).to.be.an("object");
            expect(res.extra).to.equal("yes");
        });
    });
    describe("::for_app", function() {
        it("Can mount", async function() {
            class _H extends Handler {
                async handle(req, res, next) {
                    res.extra = "yes";
                }
            }

            const app = new App();

            _H.for_app(app, OPTS_DEV);

            const res = await app.handle("GET", "/", new Request());

            expect(res).to.be.an("object");
            expect(res.extra).to.equal("yes");
        });
    });
});
/* eslint-enable no-unused-vars */
