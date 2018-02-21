const shortid = require("shortid"); // require modules
const crypto = require("crypto");

function createHtmlTable(tabledata) {
    var html =" ";
    for (let i = 0; i < tabledata.length; i++) {
        html += ' <tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top; border-bottom: 1px solid #eee; padding: 5px;" valign="top">'+tabledata[i].url+'</td><td class="receipt-figure" style="font-family: sans-serif; font-size: 14px; vertical-align: top; border-bottom: 1px solid #eee; padding: 5px; text-align: right;" valign="top" align="right">'+tabledata[i].time+'</td></tr> ';
    }
    return html;
}

// functions
function generate_password(len = 16) {
    // use crypto for generating the random string
    return crypto.randomBytes(len).toString("hex");
}

function hash(string, format = "hex") {
    return crypto.createHash("sha512").update(string).digest(format || "hex");
}

function encrypt(buffer, key, algorithm = "aes-256-ctr"){
    var iv = crypto.randomBytes(16);
    var password = crypto.createHash("md5").update(key).digest("hex")
    var cipher = crypto.createCipheriv(algorithm, password, iv);
    var crypted = Buffer.concat([iv, cipher.update(buffer), cipher.final()]).toString("base64");
    return crypted;
}
   
function decrypt(buffer, key, algorithm = "aes-256-ctr"){
    buffer = new Buffer(buffer, "base64");
    var iv = buffer.slice(0, 16);
    buffer = buffer.slice(16);
    var password = crypto.createHash("md5").update(key).digest("hex");
    var decipher = crypto.createDecipheriv(algorithm, password, iv);
    var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
    return dec;
}
  
// export modules
module.exports.generate_password = generate_password;
module.exports.createHtmlTable = createHtmlTable;
module.exports.shortid = shortid.generate;
module.exports.hash = hash;
module.exports.aes = {
    encrypt: encrypt,
    decrypt: decrypt
};