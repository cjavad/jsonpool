/**
 * javascript functions for interacting with jsonpool.
 * Uses jquery.ajax from jquery.
 * 
 * Remember to set the correct contentType
 */

const base_url = "/pool/"

function create_pool(object, callback, private = false) {
    var priv = "";

    // create query if private is true
    if (private) {
        priv = "?private=1"
    }

    $.ajax({
        method: "POST",
        url: (base_url + priv), // add priv string
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(object)

    }).done(function (res) {
        callback(res);
    });
}

function get_pool(id, callback, auth = null) {
    var q = "";
    // create query
    if (auth) {
        q = "?auth=" + auth;
    }

    $.ajax({
        method: "GET",
        url: base_url + id + q

    }).done(function (res) {
        callback(res);
    });
}

function delete_pool(id, auth, callback) {
    $.ajax({
        method: "DELETE",
        url: base_url + id,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({auth: auth})

    }).done(function (res) {
        callback(res);
    });
}

function update_pool(id, auth, object, callback, override = true) {
    $.ajax({
        method: "PUT",
        url: base_url + id,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({auth: auth, override: override, data: object})

    }).done(function (res) {
        callback(res);
    });
}