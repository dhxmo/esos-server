const mongoose = require("mongoose");

const Hospital = mongoose.model('Hospitals', new mongoose.Schema({
    phoneNumber: String,
    password: String,
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
    availability: { type: Boolean, default: true },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}).index({ location: '2dsphere' }));

module.exports = Hospital;