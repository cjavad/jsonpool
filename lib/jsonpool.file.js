const fs = require("fs");
var {generate_password, createHtmlTable, hash, shortid, aes} = require("./jsonpool.base");

module.exports = function (app, POOL_DIR = "/pools/") {
    // read and parse json files
    function getData(id) {
        var filename = id + ".json";
        var data = JSON.parse(fs.readFileSync(POOL_DIR + filename.toString("utf8")));
        return data;
    }

    function exists(key) {
        var filename = key + ".json";
        // check if file exists in the pools folder
        return fs.existsSync(POOL_DIR + filename);
    }
    
    
    function checkauth(id, auth) {
        // get key from database
        var auth_key = getData(id).auth;
        // check if the hashed auth key matches
        if (auth_key === hash(auth)) {
            return true;
        }
        // else return false
        return false;
    }
    // create
    app.post("/pool", (req, res) => {
        var data = req.body || req.query;

        if (!(typeof data == "object")) {
            res.status(500).send("500: Json not valid, Body does not contain valid json"); // render("error", { errorname: "Json not valid", errorcode: 500, details: "Body does not contain valid json" });

        } else {
            var perm = !isNaN(req.query.private) ? Number(req.query.private):0;
            // create and send response
            var id = shortid();
            var pass = generate_password();
            var filename = id + ".json";
            // encrypt data if needed
            if (perm) {
                data = aes.encrypt(JSON.stringify(data), pass);
            }

            // try to write to file
            fs.writeFile(POOL_DIR + filename, JSON.stringify({
                id: id,
                auth: hash(pass),
                data: data,
                time: new Date().toString(),
                perm: perm

            }), (err) => {
                // if there is no errors
                if (!err) {
                    res.header("Content-Type", "application/json");
                    // then send correct response
                    res.send({auth: pass, id: id});
                } else {
                    res.header("Content-Type", "text/plain");
                    // else send a HTTP error code 500
                    res.status(500).send("500: Internal Server Error");
                }
            });
        }
    });
    
    // give list of all pools when get'ing /pool
    app.get("/pool", (req, res) => {
        let ids = [];
        let data = [];
        var base_url = "/pool/";
        // list all files in directory
        fs.readdir(POOL_DIR, (err, files = []) => {
            // go over files
            for (let i = 0; i < files.length; i++) {
                ids.push(files[i].replace(".json", ""));
            }
            // loop over ids and create a base html list with objects
            for (let i = 0; i < ids.length; i++) {
                var dat = getData(ids[i]);
                if (!dat.perm) {
                    data.push({time: dat.time, url: "<a href='"+base_url+ids[i]+"'>"+ids[i]+"</a>"});
                }
            }
            res.header("Content-Type", "text/html");
            // render url-browser with a html-list (converted)
            res.render("browse", {list: createHtmlTable(data), total: data.length});
        }); 
    });

    // update
    app.put("/pool/:id", (req, res) => {
        var id = req.params.id;
        var filename = id + ".json";
        var auth = req.body.auth || req.query.auth;
        var data = req.body.data || req.query.data;
        var override = req.body.override || req.query.override || false


        if (exists(id)) {

            if (checkauth(id, auth)) {
                // check if body is valid json
                if (typeof data !== "object") res.header("Content-Type", "text/plain"); res.status(500).send("500: Json not valid, Body does not contain valid json"); //.render("error", { errorname: "Json not valid", errorcode: 500, details: "Body does not contain valid json" });
                // copy all data from file
                var dat = getData(id, auth);
                // check if we should override
                if (override) {
                    // if private then encrypt the data
                    dat.data = dat.perm ? aes.encrypt(JSON.stringify(data), auth):data;
                } else {
                    // if private decrypt and encrypt the data
                    dat.data = dat.perm ? aes.encrypt(JSON.stringify(Object.assign(aes.decrypt(JSON.parse(dat.data), auth), data)), auth):Object.assign(dat.data, data);
                }
                // write data
                fs.writeFile(POOL_DIR + filename, JSON.stringify(dat), (err) => {
                    // if everything goes well then set status to ok
                    if (!err) {
                        res.header("Content-Type", "application/json");
                        res.send({"status":"ok"});
                    } else {
                        res.header("Content-Type", "text/plain");
                        // else send a HTTP error code 500
                        res.status(500).send("500: Internal Server Error");
                    }
                });
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
        var filename = id + ".json";
        var auth = req.body.auth || req.query.auth;

        if (exists(id)) {
            if (checkauth(id, auth)) {
                // delete file
                fs.unlink(POOL_DIR + filename, (err) => {
                    if (!err) {
                        res.header("Content-Type", "application/json");
                        res.send({"status":"ok"});
                    } else {
                        res.header("Content-Type", "text/plain");
                        // else send a HTTP error code 500
                        res.status(500).send("500: Internal Server Error");
                    }
                });

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
            var data = getData(id);
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
                res.header("Content-Type", "application/json");
                res.send(data.data);
            }
        } else {
            res.header("Content-Type", "text/html");
            res.status(500).render("error", { errorname: "Pool Not Found", errorcode: 500, details: "Pool \"" + id + "\" does not exist or can't be found" });
        }
    });
}