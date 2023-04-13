
/**
 * The asseverate collection class
 */
class Collection {
    static prefix = "";
    static middlewares = [];
    static controllers = [];

    constructor({
        dev=false,
        penalty_ms=1000,
    }={}) {
        this._dev = !!dev;
        this._penalty_ms = penalty_ms;
        this._controllers = [];
        this.constructor.controllers.forEach(C => this.attach_controller(C));
        this._middlewares = [];
        this.constructor.middlewares.forEach(M => this.attach_middleware(M));
    }

    get prefix() { return this.constructor.prefix; }
    get dev() { return this._dev; }
    get penalty_ms() { return this._penalty_ms; }
    get controllers() { return this._controllers; }
    get middlewares() { return this._middlewares; }

    attach_middleware(middleware_constructor) {
        const middleware = middleware_constructor.for_collection(this);
        this.middlewares.push(middleware);
    }

    attach_controller(controller_constructor) {
        const controller = controller_constructor.for_collection(this);
        this.controllers.push(controller);
    }

    mount(app) {
        for ( const middleware of this.middlewares ) middleware.mount(app);
        for ( const controller of this.controllers ) controller.mount(app);
    }
}

module.exports = Collection;
