var {generate_password, createHtmlTable, hash, shortid, aes} = require("./jsonpool.base");

module.exports = function(app) {
    // init database
    var db = new (require("node-json-db"))("db.json", true, false);

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
        // get key from database
        var auth_key = db.getData("/" + id + "/auth");
        // check if they match
        if (auth_key === hash(auth)) {
            return true;
        }

        return false;
    }
    // give list of all pools when get'ing /pool
    app.get("/pool", (req, res) => {
        var data = [];
        var base_url = "/pool/";
        var keys = Object.keys(db.getData("/"));
    
        for (let i = 0; i < keys.length; i++) {
            if (!db.getData("/"+keys[i]+"/perm")) {
                data.push({time: db.getData("/"+keys[i]+"/time"), url: "<a href='"+base_url+keys[i]+"'>"+keys[i]+"</a>"})
            }
        }
        // render url-browser
        res.header("Content-Type", "text/html");
        res.render("browse", {list: createHtmlTable(data), total: data.length});
    });

    // create
    app.post("/pool", (req, res) => {
        var id = shortid();
        var pass = generate_password();
        var data = req.body || req.query;

        if (!(typeof data == "object")) {
            res.header("Content-Type", "text/plain");
            res.status(500).send("500: Json not valid, Body does not contain valid json"); // render("error", { errorname: "Json not valid", errorcode: 500, details: "Body does not contain valid json" });

        } else {
            if (!isNaN(req.query.private) ? Number(req.query.private):0) {
                data = aes.encrypt(JSON.stringify(data), pass);
            }

            db.push("/" + id, {
                auth: hash(pass),
                data: data,
                perm: !isNaN(req.query.private) ? Number(req.query.private):0,
                time: new Date().toString() // add a time of creation
            }, false);
            // send required data
            res.header("Content-Type", "application/json");
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
            var override = req.body.override || req.query.override || false;

            if (checkauth(id, auth)) {
                // check if body is valid json
                if (typeof data !== "object") res.status(500).send("500: Json not valid, Body does not contain valid json"); //.render("error", { errorname: "Json not valid", errorcode: 500, details: "Body does not contain valid json" });
                
                
                var dat = db.getData("/" + id);
                // check if we should override
                if (override) {
                    // if private then encrypt the data
                    dat.data = dat.perm ? aes.encrypt(JSON.stringify(data), auth):data;
                } else {
                    // if private decrypt and encrypt the data
                    dat.data = dat.perm ? aes.encrypt(JSON.stringify(Object.assign(aes.decrypt(JSON.parse(dat.data), auth), data)), auth):Object.assign(dat.data, data);
                }
                
                db.push("/" + id, dat, true);
                res.header("Content-Type", "application/json");
                // send status ok
                res.send({"status":"ok"});
            } else {
                res.header("Content-Type", "text/plain");
                res.status(500).send("500: Wrong auth key for pool \"" + id + "\""); //.render("error", { errorname: "Wrong Auth key", errorcode: 500, details: "Wrong auth key for pool \"" + id + "\"" });
            }
        } else {
            res.header("Content-Type", "text/plain");
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
                // set content type
                res.header("Content-Type", "text/plain");
                // send status: ok
                res.send({"status":"ok"});
            
            } else {
                res.header("Content-Type", "text/plain");
                res.status(500).send("500: Wrong auth key for pool \"" + id + "\""); //.render("error", { errorname: "Wrong Auth key", errorcode: 500, details: "Wrong auth key for pool \"" + id + "\"" });
            }
        } else {
            res.header("Content-Type", "text/plain");
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
                if (auth && checkauth(id, auth)) {
                    res.header("Content-Type", "application/json");
                    res.send(JSON.parse(aes.decrypt(data.data, auth).toString()));
                } else {
                    res.header("Content-Type", "text/plain");
                    // if none is specified or it is the wrong key then send error
                    res.status(500).send("500: Wrong auth key for pool \"" + id + "\""); //.render("error", { errorname: "Wrong Auth key", errorcode: 500, details: "Wrong auth key for pool \"" + id + "\"" });
                }
            // else if it's public then just send the data
            } else {
                res.send(data.data);
            }
        } else {
            res.header("Content-Type", "text/html");
            res.status(500).render("error", { errorname: "Pool Not Found", errorcode: 500, details: "Pool \"" + id + "\" does not exist or can't be found" });
        }
    });
}