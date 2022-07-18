const crypto = require('crypto');


function encrypt(text) {

    let iv = crypto.randomBytes(16);
    let salt = crypto.randomBytes(16);
    let key = crypto.scryptSync(process.env.CRYPTO_PSW, salt, 32);

    let cipher = crypto.createCipheriv(process.env.CRYPTO_ALG, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return `${iv.toString("hex")}:${salt.toString("hex")}:${encrypted}`;

}

function decrypt(text) {

    let [ivs, salts, data] = text.split(':');
    let iv = Buffer.from(ivs, "hex");
    let salt = Buffer.from(salts, "hex");
    let key = crypto.scryptSync(process.env.CRYPTO_PSW, salt, 32);

    let decipher = crypto.createDecipheriv(process.env.CRYPTO_ALG, key, iv);
    let decrypted = decipher.update(data, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted.toString();

}

module.exports = {
    encrypt,
    decrypt
}