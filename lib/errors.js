
// From https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
const STD_MESSAGES = {
    "400": "Bad Request",
    "401": "Unauthorized",
    "403": "Forbidden",
    "404": "Not Found",
    "408": "Request Timeout",
    "409": "Conflict",
    "411": "Length Required",
    "418": "I'm a teapot",
    "500": "Internal Error",
    "501": "Not Implemented",
    "503": "Service Unavailable",
};
class HTTPCodeError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }

    static standard(code) {
        return new this(code, STD_MESSAGES[code] ?? "Error");
    }
}

module.exports = {
    HTTPCodeError
};
