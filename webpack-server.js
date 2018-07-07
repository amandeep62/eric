var  webpack = require("webpack");
// ...
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (PORT) {
    var server = new WebpackDevServer(wepback(config), {
        proxy: {
            "*": "http://localhost:" + (PORT - 1)
        }
    });
    server.listen(PORT, 'localhost');
};