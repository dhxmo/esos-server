const mongoose = require("mongoose");

const Emergency = mongoose.model('EmergencyRequest', new mongoose.Schema({
    latitude: Number,
    longitude: Number,
    selected: String,
    emergency: Boolean,
    userId: String,
    userPhone: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
}));

module.exports = Emergency 