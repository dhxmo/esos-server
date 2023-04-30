const mongoose = require("mongoose");

const AmbulanceDriver = mongoose.model(
    "AmbulanceDriver",
    new mongoose.Schema({
        phoneNumber: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        companyName: {
            type: String,
            required: true
        },
        ambulanceType: {
            type: String,
            required: true
        },
        jwtToken: {
            type: String,
        },
        role: {
            type: String,
            default: 'ambulance_driver'
        },
    })
);

module.exports = AmbulanceDriver;