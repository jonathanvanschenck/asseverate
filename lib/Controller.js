
const Handler = require("./Handler.js");

class Controller extends Handler {
    static method = "GET";
    static content_type = "application/json";
    static status_code = 200;

    get method() { return this.constructor.method; }
    get content_type() { return this.constructor.content_type; }
    get status_code() { return this.constructor.status_code; }

    async handle(req, res) {
        const request = await this.parse_request(req);
        const response = await this.respond(request);
        return this.send( res, this.status_code, response, this.content_type );
    }

    mount(app) {
        app[this.method.toLowerCase()](this.path, this);
    }

    async parse_request(req) {
        return {
            body: req.body ?? {},
            params: req.params ?? {},
            query: req.query ?? {},
            headers: req.headers ?? {},
        };
    }

    async respond(request) { // eslint-disable-line no-unused-vars
        return {};
    }

}

module.exports = Controller;
