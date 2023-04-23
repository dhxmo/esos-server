const mongoose = require('mongoose');

const RateLimit = mongoose.model(
    'RateLimit',
    new mongoose.Schema({
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },
        requestCount: {
            type: Number,
            required: true,
            default: 0,
        },
        lastRequestTime: {
            type: Date,
            required: true,
            default: Date.now,
        },
    }));

module.exports = RateLimit;
