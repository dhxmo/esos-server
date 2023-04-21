const db = require("../models");
const Emergency = db.emergency;

exports.getAllEmergencies = async (req, res) => {
    try {
        const requests = await Emergency.find();
        res.json({ data: requests, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createEmergency = async (req, res) => {
    try {
        const request = await Emergency.create({
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            selected: req.body.selected,
            emergency: req.body.emergency,
            userId: req.id
        });
        res.json({ data: request, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEmergencyById = async (req, res) => {
    try {
        const request = await Emergency.findById(req.params.id);
        res.json({ data: request, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};