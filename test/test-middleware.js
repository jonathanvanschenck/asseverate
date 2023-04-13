const expect = require("chai").expect; // eslint-disable-line node/no-unpublished-require

const { Middleware } = require("../index.js");
const { Request, Response } = require("./spoof.js");

const OPTS_DEV = {
    dev:true,
    log:null,
    penalty_ms:0,
};

/* eslint-disable no-unused-vars */
describe("Middleware", function() {
    describe("#meddle", function() {
        it("Can modify response", async function() {
            class M extends Middleware {
                async meddle(req) { req.extra = "yes"; }
            }
            const m = new M(OPTS_DEV);

            const req = new Request();
            const res = new Response();
            const next = () => {};
            await m(req, res, next);

            expect(req).to.be.an("object");
            expect(req.extra).to.equal("yes");
        });
    });
});
