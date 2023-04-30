const mongoose = require("mongoose");

const Hospital = mongoose.model('Hospitals', new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
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
}).index({ location: '2dsphere' }));

module.exports = Hospital;