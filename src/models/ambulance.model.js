const mongoose = require("mongoose");

const Ambulance = mongoose.model(
    "Ambulance",
    new mongoose.Schema({
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phoneNumber: { type: String, required: true, unique: true },
        companyName: { type: String, required: true },
        ambulanceType: { type: String, required: true },
        role: { type: String, default: 'ambulance' },
    })
);

module.exports = Ambulance;