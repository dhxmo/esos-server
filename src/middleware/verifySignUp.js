const db = require("../models");
const User = db.user;
const Ambulance = db.ambulance;

checkDuplicateEmail = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            res.status(400).send({ message: "Failed! Email is already in use!" });
            return;
        }
        next();
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

checkDuplicateNumber = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.phoneNumber });
        if (user) {
            res.status(400).send({ message: "Failed! Phone number is already in use!" });
            return;
        }
        next();
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

checkAmbulanceDuplicateEmail = async (req, res, next) => {
    try {
        const ambulance = await Ambulance.findOne({ email: req.body.email });
        if (ambulance) {
            res.status(400).send({ message: "Failed! Email is already in use!" });
            return;
        }
        next();
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

checkAmbulanceDuplicateNumber = async (req, res, next) => {
    try {
        const ambulance = await Ambulance.findOne({ email: req.body.phoneNumber });
        if (ambulance) {
            res.status(400).send({ message: "Failed! Phone number is already in use!" });
            return;
        }
        next();
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

const verifySignUp = {
    checkDuplicateEmail,
    checkDuplicateNumber,
    checkAmbulanceDuplicateEmail,
    checkAmbulanceDuplicateNumber
};

module.exports = verifySignUp;