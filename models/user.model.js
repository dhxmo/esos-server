const mongoose = require("mongoose");

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        emailConfirmed: { type: Boolean, default: false },
        phoneNumber: { type: String, required: true, unique: true },
        phoneConfirmed: { type: Boolean, default: false },
        banned: { type: Boolean, default: false },
        role: { type: String, default: 'user' },
    })
);

module.exports = User;