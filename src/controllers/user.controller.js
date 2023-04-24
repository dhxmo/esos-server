const db = require("../models");
const User = db.user;

exports.allAccess = (_, res) => {
    res.status(200).send("Public Content.");
};

exports.userBoard = (_, res) => {
    res.status(200).send("User Content.");
};

exports.adminBoard = (_, res) => {
    res.status(200).send("Admin Content.");
};

exports.ambulanceDriverBoard = (_, res) => {
    res.status(200).send("Ambulance Driver Content.");
};

exports.getUserByID = async (req, res) => {
    try {
        const request = await User.findById(req.params.id);
        res.json({ data: request, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getAllUsers = async (_, res) => {
    try {
        const requests = await User.find();
        res.json({ data: requests, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}