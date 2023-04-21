const mongoose = require("mongoose");

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        phoneNumber: { type: String, required: true, unique: true },
        banned: { type: Boolean, default: false },
        role: { type: String, default: 'user' },
    })
);

module.exports = User;