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


// functions
function generate_password(len = 16) {
    return crypto.randomBytes(len).toString("hex");
}

function exists(key) {
    // check if key exists in database
    try {
        db.getData("/" + key);
    } catch (error) {
        return false;
    }

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
// use midleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
// set public dir
app.use(express.static(path.join(__dirname + "/public")));


/* routes */

// give browser when using /pool
app.get("/pool", (req, res) => {
    var data = [];
    var base_url = "/pool/";
    var keys = Object.keys(db.getData("/"));

    for (let i = 0; i < keys.length; i++) {
        data.push({time: db.getData("/"+keys[i]+"/time"), url: "<a href='"+base_url+keys[i]+"'>"+keys[i]+"</a>"})
    }

    res.render("browse", {list: createHtmlTable(data), total: data.length});
});

// create
app.post("/pool", (req, res) => {
    var id = shortid();
    var pass = generate_password();
    var data = req.body;

    if (!(typeof data == "object")) {
        res.status(500).render("error", { errorname: "Json not valid", errorcode: 500, details: "Body does not contain valid json" });

    } else {
        db.push("/" + id, {
            auth: pass,
            data: data,
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
            if (typeof data !== "object") res.status(500).render("error", { errorname: "Json not valid", errorcode: 500, details: "Body does not contain valid json" });
            db.push("/" + id + "/data", data, override);
            res.send({"status":"ok"});
        } else {
            res.status(500).render("error", { errorname: "Wrong Auth key", errorcode: 500, details: "Wrong auth key for pool \"" + id + "\"" });
        }
    } else {
        res.status(500).render("error", { errorname: "Pool Not Found", errorcode: 500, details: "Pool \"" + id + "\" does not exist or can't be found" });
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
            res.status(500).render("error", { errorname: "Wrong Auth key", errorcode: 500, details: "Wrong auth key for pool \"" + id + "\"" });
        }
    } else {
        res.status(500).render("error", { errorname: "Pool Not Found", errorcode: 500, details: "Pool \"" + id + "\" does not exist or can't be found" });
    }   
});

// get
app.get("/pool/:id", (req, res) => {
    var id = req.params.id;

    if (exists(id)) {
        res.send(db.getData("/" + id + "/data"));
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
