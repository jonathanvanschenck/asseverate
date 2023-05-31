
/**
 * The asseverate collection class
 */
class Collection {
    static prefix = "";
    static middlewares = [];
    static controllers = [];

    constructor(opts={}) {
        const args = Object.assign({ prefix:this.constructor.prefix }, opts);
        this._controllers = [];
        this.constructor.controllers.forEach(C => this.attach_controller(C, args));
        this._middlewares = [];
        this.constructor.middlewares.forEach(M => this.attach_middleware(M, args));
    }

    get prefix() { return this.constructor.prefix; }
    get controllers() { return this._controllers; }
    get middlewares() { return this._middlewares; }

    attach_middleware(middleware_constructor, args) {
        const middleware = new middleware_constructor(args);
        this.middlewares.push(middleware);
    }

    attach_controller(controller_constructor, args) {
        const controller = new controller_constructor(args);
        this.controllers.push(controller);
    }

    mount(app) {
        for ( const middleware of this.middlewares ) middleware.mount(app);
        for ( const controller of this.controllers ) controller.mount(app);
    }

    static for_app(app, opts={}) {
        const collection = new this(opts);
        collection.mount(app);
        return collection;
    }
}

module.exports = Collection;
