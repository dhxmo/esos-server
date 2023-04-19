const db = require("../models");
const User = db.user;

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.ambulanceBoard = (req, res) => {
    res.status(200).send("Ambulance Content.");
};

exports.getUserByID = async (req, res) => {
    try {
        const request = await User.findById(req.params.id);
        res.json({ data: request, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const requests = await User.find();
        res.json({ data: requests, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}