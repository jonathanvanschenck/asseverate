
const { join } = require("path/posix");

const { HTTPCodeError } = require("./errors.js");

class Handler extends Function {
    static path = "/";

    constructor({ prefix="", dev=false, penalty_ms=1000 }={}) {
        super();

        this._dev = dev;
        this._penalty_ms = penalty_ms;
        this._prefix = prefix;

        // Thanks to: https://hackernoon.com/creating-callable-objects-in-javascript-d21l3te1
        return new Proxy(this, {
            apply: (target, this_arg, args) => this.call(...args)
        });
    }

    get path() { return join( this._prefix, this.constructor.path ); }
    get prefix() { return this._prefix; }
    get penalty_ms() { return this._penalty_ms; }
    get dev() { return this._dev; }

    async call(req, res, next) {
        try {
            await this.handle(req, res, next);
        } catch (e) {
            if ( e instanceof HTTPCodeError ) {
                return this.send_message( res, e.code, e.message );
            } else {
                return this.handle_error(res, e);
            }
        }
    }

    /**
     * Handle the incoming request
     */
    async handle(req,res,next) { return next(); }

    async handle_error(response, error) {
        if ( this.dev ) {
            return this.send( response, 500, {
                message: error?.message,
                type: error?.constructor?.name,
                stack: error?.stack,
                error: { ...error },
            });
        } else {
            return this.send_message( response, 500, "internal error");
        }
    }

    /**
     * Wait for the penalty time
     */
    async penalize() {
        return new Promise(res => setTimeout(res, this.penalty_ms));
    }

    /**
     * Send a response to the client
     */
    async send( response, code=204, body=null, content_type="application/json" ) {
        if (body) response.set('Content-Type', content_type);
        return response.status(code).send(body);
    }

    /**
     * Send a "message" response (helpful for errors)
     */
    async send_message( response, code, message ) {
        return this.send( response, code, typeof(message) == "string" ? { message } : message);
    }

    mount(app) {
        app.use(this.path, this);
    }

    static for_app(app, opts={}) {
        const handler = new this(opts);
        handler.mount(app);
        return this;
    }

    static for_collection(collection) {
        return new this({
            prefix: collection.prefix,
            penalty_ms: collection.penalty_ms,
            dev: collection.dev
        });
    }
}

module.exports = Handler;
