const mongoose = require('mongoose');

const EmergencyRecording = mongoose.model('Emergency', new mongoose.Schema({
    emergencyId: {
        type: String,
        required: true,
    },
    audio: {
        type: Buffer,
        required: true,
    },
}));

module.exports = EmergencyRecording;
