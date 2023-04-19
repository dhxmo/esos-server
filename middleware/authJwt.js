const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;
const Role = db.role;

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
        const roles = await Role.find({ _id: { $in: user.roles } });
        const adminRole = roles.find((role) => role.name === "admin");
        if (!adminRole) {
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
        const user = await User.findById(req.userId);
        const roles = await Role.find({ _id: { $in: user.roles } });
        const ambulanceRole = roles.find((role) => role.name === "ambulance" || role.name === 'admin');
        if (!ambulanceRole) {
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
        const roles = await Role.find({ _id: { $in: user.roles } });
        const userRole = roles.find((role) => role.name === "user" || role.name === 'admin');
        if (!userRole) {
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