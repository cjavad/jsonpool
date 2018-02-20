/**
 * javascript functions for interacting with jsonpool.
 * Uses jquery.ajax from jquery.
 * 
 * Remember to set the correct contentType
 */

const base_url = "/pool/"

function create_pool(object, callback) {
    $.ajax({
        method: "POST",
        url: base_url,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(object)

    }).done(function (res) {
        callback(res);
    });
}

function get_pool(id, callback) {
    $.ajax({
        method: "GET",
        url: base_url + id

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

function update_pool(id, auth, object, callback) {
    $.ajax({
        method: "PUT",
        url: base_url + id,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({auth: auth, override: true, data: object})

    }).done(function (res) {
        callback(res);
    });
}