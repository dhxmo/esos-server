const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const requestSchema = new mongoose.Schema({
    latitude: Number,
    longitude: Number,
    selected: String,
    emergency: Boolean,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Request', requestSchema);