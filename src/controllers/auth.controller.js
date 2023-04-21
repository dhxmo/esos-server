const db = require("../models");
const User = db.user;
const Ambulance = db.ambulance;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

require('dotenv').config()
const { JWT_SECRET } = process.env;

const phoneNumberRegex = /^\d{10}$/;

// TODO: remove once admin is registered
exports.adminRegister = async (req, res) => {
    try {
        const phoneNumber = req.body.phoneNumber;

        if (!phoneNumberRegex.test(phoneNumber)) {
            return res.status(401).send({ message: "Invalid Phone Number" });
        }

        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 15),
            phoneNumber: phoneNumber,
            role: "admin"
        });

        await user.save();

        return res.send({ message: "Admin was registered successfully!" });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.userRegister = async (req, res) => {
    console.log(req);
    try {
        const phoneNumber = req.body.phoneNumber;

        if (!phoneNumberRegex.test(phoneNumber)) {
            return res.status(401).send({ message: "Invalid Phone Number" });
        }

        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 15),
            phoneNumber: phoneNumber
        });

        await user.save();

        return res.send({ message: "User was registered successfully!" });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.userLogIn = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email }).populate("role", "-__v");
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid Password!" });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 86400 });

        const authority = user.role.toUpperCase();

        req.session.token = token;

        res.status(200).send({
            id: user._id,
            email: user.email,
            role: authority,
        });
    } catch (err) {
        res.status(500).send({ message: err });
    }
};


exports.logout = async (req, res) => {
    try {
        req.session = null;
        return res.status(200).send({ message: "You've been signed out!" });
    } catch (err) {
        this.next(err);
    }
};

exports.ambulanceRegister = async (req, res) => {
    try {
        const phoneNumber = req.body.phoneNumber;

        if (!phoneNumberRegex.test(phoneNumber)) {
            return res.status(401).send({ message: "Invalid Phone Number" });
        }

        const ambulance = new Ambulance({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 15),
            phoneNumber: phoneNumber,
            companyName: req.body.companyName,
            ambulanceType: req.body.ambulanceType
        });

        await ambulance.save();

        return res.send({ message: "Ambulance was registered successfully!" });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.ambulanceLogIn = async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ email: req.body.email }).populate("role", "-__v");
        if (!ambulance) {
            return res.status(404).send({ message: "Ambulance Not found." });
        }

        const passwordIsValid = bcrypt.compareSync(req.body.password, ambulance.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid Password!" });
        }

        const token = jwt.sign({ id: ambulance.id }, JWT_SECRET, { expiresIn: 86400 });

        const authority = ambulance.role.toUpperCase();

        req.session.token = token;

        res.status(200).send({
            id: ambulance._id,
            email: ambulance.email,
            company: ambulance.companyName,
            role: authority,
        });
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

exports.banUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.banned = true;

        await user.save();

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};