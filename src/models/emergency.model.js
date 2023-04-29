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
    selected: {
        type: String,
        required: true
    },
    emergency: {
        type: Boolean,
        require: true
    },
    userId: {
        type: String,
        required: true
    },
    userPhone: {
        type: String,
        required: true
    },
    assignedDriver: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}).index({ location: '2dsphere' }));

module.exports = Emergency 