const mongoose = require("mongoose");

const Emergency = mongoose.model('Request', new mongoose.Schema({
    latitude: Number,
    longitude: Number,
    selected: String,
    emergency: Boolean,
    userId: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
}));

module.exports = Emergency 