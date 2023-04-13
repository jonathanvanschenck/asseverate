
const RouteParser = require("route-parser");

class App {
    constructor() {
        this.paths = [];
    }

    async use(path, func) {
        this.paths.push({
            path: new RouteParser(path+"*_remainder"),
            func
        });
    }

    async get(path, func) {
        this.paths.push({
            path: new RouteParser(path),
            method:"GET",
            func
        });
    }

    async post(path, func) {
        this.paths.push({
            path: new RouteParser(path),
            method:"POST",
            func
        });
    }

    async patch(path, func) {
        this.paths.push({
            path: new RouteParser(path),
            method:"PATCH",
            func
        });
    }

    async put(path, func) {
        this.paths.push({
            path: new RouteParser(path),
            method:"PUT",
            func
        });
    }

    async delete(path, func) {
        this.paths.push({
            path: new RouteParser(path),
            method:"DELETE",
            func
        });
    }

    async handle(method, path, request) {
        const response = new Response();
        for ( const { path:_path, method:_method, func } of this.paths ) {
            if ( (_method && _method != method) ) continue;
            const params = _path.match(path);
            if ( !params ) continue;
            request.params = params;
            let nexted = false;
            await func(request, response, () => { nexted = true; });
            if ( nexted ) continue;
            return response;
        }
        return response;
    }
}

class Request {
    constructor({
        body=null,
        params={},
        query={},
        headers={}
    }={}) {
        this.body = body;
        this.params = params;
        this.query = query;
        this.headers = {};
        if ( headers ) for ( const key in headers ) this.headers[key.toLowerCase()] = headers[key];
    }

    get(key) {
        return this.headers[key.toLowerCase()];
    }
}

class Response {
    constructor() {
        this.body = null;
        this.headers = {};
        this.statusCode = null;
    }

    set(key, value) {
        this.headers[key.toLowerCase()] = value;
        return this;
    }
    status(code) {
        this.statusCode = code;
        return this;
    }
    send(body) {
        this.body = body;
        return this;
    }
}

module.exports = {
    Request,
    Response,
    App,
};
