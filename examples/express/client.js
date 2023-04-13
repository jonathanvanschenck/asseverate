
const { request:$ } = require("http");

function request(method, url, body='', api_key=undefined) {

    // Setup the options object
    let options = {
        method : method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if ( typeof(body) !== "string" ) body = JSON.stringify(body);

    if ( api_key )  options.headers['X-API-KEY'] = api_key;

    return new Promise((resolve, reject) => {

        const req = $(url, options, (res) => {
            res.setEncoding('utf-8');
            res.data = '';
            res.on('data', (chunk) => res.data = res.data + chunk);
            res.on('end', () => {
                res.type = res.headers['content-type'];
                try {
                    res.type = res.type.match(/(application|text)\/([^;]+)/)[2];
                } catch (e) {
                    resolve(res);
                    return;
                }
                if ( res.type.includes("json") ) {
                    try {
                        res.data = JSON.parse( res.data || '' );
                    } catch (e) {
                        reject(e);
                        return;
                    }
                    resolve(res);
                } else {
                    resolve(res);
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

!async function() {
    await request("GET","http://localhost:5000/test").then(resp => console.log("GET", "/test", { statusCode: resp.statusCode, data: resp.data }));
    await request("GET","http://localhost:5000/test/bad").then(resp => console.log("GET", "/test/bad", { statusCode: resp.statusCode, data: resp.data }));
    await request("GET","http://localhost:5000/users/users").then(resp => console.log("GET (no key)", "/users/users", { statusCode: resp.statusCode, data: resp.data }));
    await request("GET","http://localhost:5000/users/users", "", "secret").then(resp => console.log("GET", "/users/users", { statusCode: resp.statusCode, data: resp.data }));
    await request("GET","http://localhost:5000/users/user/1", "", "secret").then(resp => console.log("GET", "/users/user/1", { statusCode: resp.statusCode, data: resp.data }));
    await request("GET","http://localhost:5000/users/user/bad", "", "secret").then(resp => console.log("GET", "/users/user/bad", { statusCode: resp.statusCode, data: resp.data }));
    await request("POST","http://localhost:5000/users/users", { id:10 }, "secret").then(resp => console.log("POST", "/users/users", { statusCode: resp.statusCode, data: resp.data }));
    await request("POST","http://localhost:5000/users/users", { id:"bad" }, "secret").then(resp => console.log("POST (bad id)", "/users/users", { statusCode: resp.statusCode, data: resp.data }));
}();
