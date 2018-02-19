// get config
const config = require("./config.json");
// check for env variable
config.port = process.env.PORT || config.port;

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

// use body parser
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
// set public dir
app.use(express.static(path.join(__dirname + "/public")));


// routes

// create
app.post("/pool", (req, res) => {
    var id = shortid();
    var pass = generate_password();
    var data = req.body;

    if (!(typeof data == "object")) {
        res.status(500).send("Error: body is not valid json");

    } else {
        db.push("/" + id, {
            auth: pass,
            data: data
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
        var auth = req.body.auth || req.query.auth;
        var data = req.body.data || req.query.data;

        if (checkauth(id, auth) && typeof data == "object") {
            db.push("/" + id + "/data", data, false);
            res.send({"status":"ok"});
        } else {
            res.status(500).send("Error: Wrong auth key");
        }
    } else {
        res.status(500).send("Error: pool does not exist");
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
            res.status(500).send("Error: Wrong auth key");
        }
    } else {
        res.status(500).send("Error: pool does not exist");
    }   
});

// get
app.get("/pool/:id", (req, res) => {
    var id = req.params.id;

    if (exists(id)) {
        res.send(db.getData("/" + id + "/data"));
    } else {
        res.status(500).send("Error: pool does not exist");
    }
});

// listen on a port
app.listen(config.port, () => {
    console.log("Listning on port", config.port);
})
