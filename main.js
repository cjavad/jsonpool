#!/usr/bin/env node
"use strict";
// check for env variable
var port = process.env.PORT || 8080;

const shortid = require("shortid"); // require modules
const crypto = require("crypto");
const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");

var app = express(); // init app 
var db = new (require("node-json-db"))("db.json", true, false); // create database

// Capture all errors
process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
  });

// functions
function generate_password(len = 16) {
    // use crypto for generating the random string
    return crypto.randomBytes(len).toString("hex");
}

function exists(key) {
    // check if key exists in database
    try {
        db.getData("/" + key);
    } catch (error) {
        return false;
    }
    // else return true
    return true;
}


function checkauth(id, auth) {
    if (!exists(id)) return;
    var auth_key = db.getData("/" + id + "/auth");
    if (auth_key === auth) {
        return true;
    }

    return false;
}

function createHtmlTable(tabledata){
    var html =" ";
  
    for (let i = 0; i < tabledata.length; i++) {
      html += ' <tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top; border-bottom: 1px solid #eee; padding: 5px;" valign="top">'+tabledata[i].url+'</td><td class="receipt-figure" style="font-family: sans-serif; font-size: 14px; vertical-align: top; border-bottom: 1px solid #eee; padding: 5px; text-align: right;" valign="top" align="right">'+tabledata[i].time+'</td></tr> ';
    }
    return html;
  } 

// set express headers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // some fun
    res.header("X-Powered-By", "RAINBOW FARTS");
    res.header("Server", "RAINBOWS + FARTS = ©_©");
    // continue
    next();
});

// set view engine to pug
app.set('view engine', 'pug');
// use middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
// set public dir
app.use(express.static(path.join(__dirname + "/public")));


/* routes */

// give list of all pools when get'ing /pool
app.get("/pool", (req, res) => {
    var data = [];
    var base_url = "/pool/";
    var keys = Object.keys(db.getData("/"));

    for (let i = 0; i < keys.length; i++) {
        data.push({time: db.getData("/"+keys[i]+"/time"), url: "<a href='"+base_url+keys[i]+"'>"+keys[i]+"</a>"})
    }
    // render url-browser
    res.render("browse", {list: createHtmlTable(data), total: data.length});
});

// create
app.post("/pool", (req, res) => {
    var id = shortid();
    var pass = generate_password();
    var data = req.body;

    if (!(typeof data == "object")) {
        res.status(500).send("500: Json not valid, Body does not contain valid json"); // render("error", { errorname: "Json not valid", errorcode: 500, details: "Body does not contain valid json" });

    } else {
        db.push("/" + id, {
            auth: pass,
            data: data,
            perm: !isNaN(req.query.private) ? Number(req.query.private):0,
            time: new Date().toString() // add a time of creation
        }, false);
        // send required data
        res.send({
            auth: pass,
            id: id
        });
    }
});

// update
app.put("/pool/:id", (req, res) => {
    var id = req.params.id;

    if (exists(id)) {
        var auth = req.body.auth;
        var data = req.body.data;
        var override = req.body.override|| false

        if (checkauth(id, auth)) {
            // check if body is valid json
            if (typeof data !== "object") res.status(500).send("500: Json not valid, Body does not contain valid json"); //.render("error", { errorname: "Json not valid", errorcode: 500, details: "Body does not contain valid json" });
            db.push("/" + id + "/data", data, override);
            res.send({"status":"ok"});
        } else {
            res.status(500).send("500: Wrong auth key for pool \"" + id + "\""); //.render("error", { errorname: "Wrong Auth key", errorcode: 500, details: "Wrong auth key for pool \"" + id + "\"" });
        }
    } else {
        res.status(404).send("404: Pool does not exist"); //.render("error", { errorname: "Pool Not Found", errorcode: 500, details: "Pool \"" + id + "\" does not exist or can't be found" });
    }
});

//delete
app.delete("/pool/:id", (req, res) => {
    var id = req.params.id;

    if (exists(id)) {
        var auth = req.body.auth || req.query.auth;

        if (checkauth(id, auth)) {
            db.delete("/" + id );
            res.send({"status":"ok"});
            return;
        } else {
            res.status(500).send("500: Wrong auth key for pool \"" + id + "\""); //.render("error", { errorname: "Wrong Auth key", errorcode: 500, details: "Wrong auth key for pool \"" + id + "\"" });
        }
    } else {
        res.status(404).send("404: Pool does not exist"); //.render("error", { errorname: "Pool Not Found", errorcode: 500, details: "Pool \"" + id + "\" does not exist or can't be found" });
    }   
});

// get
app.get("/pool/:id", (req, res) => {
    var id = req.params.id;
    var auth = req.body.auth || req.query.auth;

    if (exists(id)) {
        var data = db.getData("/" + id);
        // check if it's private
        if (data.perm) {
            // if it is check auth
            if (checkauth(id, auth)) {
                res.send(data.data);
            } else {
                // if none is specified or it is the wrong key then send error
                res.status(500).send("500: Wrong auth key for pool \"" + id + "\""); //.render("error", { errorname: "Wrong Auth key", errorcode: 500, details: "Wrong auth key for pool \"" + id + "\"" });
            }
        // else if it's public then just send the data
        } else {
            res.send(data.data);
        }
    } else {
        res.status(500).render("error", { errorname: "Pool Not Found", errorcode: 500, details: "Pool \"" + id + "\" does not exist or can't be found" });
    }
});

// 404 error for get
app.get("*", (req, res) => { res.render("error", {errorname: "Page not found", errorcode: 404, details: req.url}); });

// listen on a port
app.listen(port, () => {
    console.log("Listning on http://0.0.0.0:" + port);
})
