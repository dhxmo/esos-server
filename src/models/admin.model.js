const mongoose = require("mongoose");

const Admin = mongoose.model(
    "Admin",
    new mongoose.Schema({
        phoneNumber: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, default: 'admin' },
    })
);

module.exports = Admin;