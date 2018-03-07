#!/usr/bin/env node
"use strict";
// check for config
var port = process.env.PORT || 8080;
var useFs = process.argv[2] === "fs";
// require modules
const path = require("path");
const express = require("express");
// require middleware
const bodyparser = require("body-parser");
const compression = require('compression');


var app = express(); // init app

/* Capture all errors
process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});*/


// set express headers
app.use((req, res, next) => {
    // security
    res.header("Content-Security-Policy", "script-src 'self'; worker-src 'self' blob: " + req.protocol + "://" + req.get("host") + "; style-src 'self' 'unsafe-inline'");
    res.header("X-Frame-Options", "DENY"); // deny iframe access
    res.header("X-XSS-Protection", "1; mode = block");
    res.header("X-Content-Type-Options", "nosniff");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // some fun
    res.header("X-Powered-By", "Pixidust");
    // res.header("Server", "Magic");
    // continue
    next();
});

// set view engine to pug
app.set('view engine', 'pug');
// use middleware
app.use(compression({level: 1}));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "/public/")));

/* routes */

// if we shall use the file system
if (useFs) {
    require("./lib/jsonpool.file")(app, path.join(__dirname + "/pools/"));
} else {
    // else use json database
    require("./lib/jsonpool.json")(app);
}

// 404 error for get
app.get("*", (req, res) => { res.header("Content-Type", "text/html"); res.status(404).render("error", {errorname: "Page not found", errorcode: 404, details: req.url}); });

// listen on a port
app.listen(port, () => {
    // and print url that we're listening on
    console.log("Listning on http:\/\/0.0.0.0:" + port);
});
