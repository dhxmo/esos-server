const mongoose = require("mongoose");

const DriverLive = mongoose.model('DriverLive', new mongoose.Schema({
    driverPhone: String,
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
    availability: Boolean,
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}).index({ location: '2dsphere' }));

module.exports = DriverLive; 