const db = require("../models");
const User = db.user;
const Ambulance = db.ambulance;

checkDuplicateNumber = async (req, res, next) => {
    try {
        const user = await User.findOne({ phoneNumber: req.body.phoneNumber });
        if (user) {
            res.status(400).send({ message: "Failed! Phone number is already in use!" });
            return;
        }
        next();
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

checkAmbulanceDuplicateNumber = async (req, res, next) => {
    try {
        const ambulance = await Ambulance.findOne({ phoneNumber: req.body.phoneNumber });
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
    checkDuplicateNumber,
    checkAmbulanceDuplicateNumber
};

module.exports = verifySignUp;