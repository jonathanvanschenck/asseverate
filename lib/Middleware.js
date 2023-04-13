
const Handler = require("./Handler.js");

class Middleware extends Handler {
    async handle(req, res, next) {
        await this.meddle(req);
        return next();
    }

    async meddle(req) {} // eslint-disable-line no-unused-vars
}

module.exports = exports = Middleware;

