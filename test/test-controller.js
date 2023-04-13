
const expect = require("chai").expect; // eslint-disable-line node/no-unpublished-require

const { App, Request, Response } = require("./spoof.js");
const { Controller, HTTPCodeError } = require("../index.js");

const OPTS_DEV = {
    dev:true,
    log:null,
    penalty_ms:0,
};

/* eslint-disable no-unused-vars */
describe("Controller", function() {
    describe("#respond", function() {
        it("Can get a response via .call", async function() {
            class C extends Controller {
                async respond(request) { return { ok:true }; }
            }
            const c = new C(OPTS_DEV);

            const req = new Request();
            const res = new Response();
            const next = () => {};
            await c(req, res, next);

            expect(res.body).to.be.an("object");
            expect(res.body.ok).to.equal(true);
        });
        it("Can return information from request", async function() {
            class C extends Controller {
                async respond(request) { return { id:request.body.id }; }
            }
            const c = new C(OPTS_DEV);

            const req = new Request({ body: { id:1 } });
            const res = new Response();
            const next = () => {};
            await c(req, res, next);

            expect(res.body).to.be.an("object");
            expect(res.body.id).to.equal(1);
        });
    });
    describe("#parse_request", function() {
        it("Can change request params type", async function() {
            class C extends Controller {
                async parse_request(req) {
                    return {
                        params: {
                            id: +req.params.id,
                        }
                    };
                }
                async respond(request) { return { id: request.params.id }; }
            }
            const c = new C(OPTS_DEV);

            const req = new Request({ params: { id:"1" } });
            const res = new Response();
            const next = () => {};
            await c(req, res, next);

            expect(res.body).to.be.an("object");
            expect(res.body.id).to.equal(1);
        });
        it("Can auto fail on bad param types", async function() {
            class C extends Controller {
                async parse_request(req) {
                    const id = parseInt(req.params.id);
                    if ( isNaN(id) ) throw HTTPCodeError.standard(404);
                    return {
                        params: {
                            id
                        }
                    };
                }
                async respond(request) { return { id: request.params.id }; }
            }
            const c = new C(OPTS_DEV);

            const req = new Request({ params: { id:"bad" } });
            const res = new Response();
            const next = () => {};
            await c(req, res, next);

            expect(res.statusCode).to.equal(404);
        });
    });
    describe("::for_app", function() {
        it("GET", async function() {
            class C extends Controller {
                static method = "GET";
            }
            const app = new App();
            C.for_app(app, OPTS_DEV);
            const res = await app.handle("GET", "/", new Request());
            expect(res.statusCode).to.equal(200);
        });
    });
    describe("#mount", function() {
        it("GET", async function() {
            class C extends Controller {
                static method = "GET";
            }
            const c = new C(OPTS_DEV);
            const app = new App();
            c.mount(app);
            const res = await app.handle("GET", "/", new Request());
            expect(res.statusCode).to.equal(200);
        });
        it("POST (and not GET)", async function() {
            class C extends Controller {
                static method = "POST";
            }
            const c = new C(OPTS_DEV);
            const app = new App();
            c.mount(app);
            const res = await app.handle("POST", "/", new Request());
            expect(res.statusCode).to.equal(200);

            const res2 = await app.handle("GET", "/", new Request());
            expect(res2.statusCode).to.equal(null);
        });
        it("Can differentiate paths", async function() {
            class C extends Controller {
                static path = "/test";
            }
            const c = new C(OPTS_DEV);
            const app = new App();
            c.mount(app);
            const res = await app.handle("GET", "/test", new Request());
            expect(res.statusCode).to.equal(200);

            const res2 = await app.handle("GET", "/", new Request());
            expect(res2.statusCode).to.equal(null);
        });
    });
});
/* eslint-enable no-unused-vars */
