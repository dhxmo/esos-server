const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;
const Ambulance = db.ambulance;

require('dotenv').config()
const { JWT_SECRET } = process.env;

verifyToken = (req, res, next) => {
    let token = req.session.token;

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.userId = decoded.id;
        next();
    });
};

isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            res.status(403).send({ message: "Require Admin Role!" });
            return;
        }
        next();
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

isAmbulance = async (req, res, next) => {
    try {
        const ambulance = await Ambulance.findById(req.userId);
        if (ambulance.role !== 'ambulance') {
            res.status(403).send({ message: "Require Ambulance Role!" });
            return;
        }
        next();
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

isUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'user') {
            res.status(403).send({ message: "Require User Role!" });
            return;
        }
        next();
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

const authJwt = {
    verifyToken,
    isAdmin,
    isAmbulance,
    isUser
};
module.exports = authJwt;