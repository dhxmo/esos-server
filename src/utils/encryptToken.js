const crypto = require('crypto');
const algorithm = 'aes-256-cbc';

require('dotenv').config()
const { HASH_SECRET, INIT_VECTOR } = process.env;

const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, HASH_SECRET, INIT_VECTOR);
    let encryptedData = cipher.update(text, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return encryptedData
}

const decrypt = (encryptedData) => {
    const decipher = crypto.createDecipheriv(algorithm, HASH_SECRET, INIT_VECTOR);
    let text = decipher.update(encryptedData, "hex", "utf-8");
    text += decipher.final("utf-8");
    return text
}

module.exports = { encrypt, decrypt }