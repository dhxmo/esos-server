const mongoose = require("mongoose");

const Emergency = mongoose.model('EmergencyRequest', new mongoose.Schema({
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    selected: String,
    emergency: Boolean,
    userId: String,
    userPhone: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
}).index({ location: '2dsphere' }));

module.exports = Emergency 