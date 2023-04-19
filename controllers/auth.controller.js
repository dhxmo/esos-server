const db = require("../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

require('dotenv').config()
const { JWT_SECRET } = process.env;

exports.signup = async (req, res) => {
    try {
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
        });

        const savedUser = await user.save();

        if (req.body.roles) {
            const roles = await Role.find({ name: { $in: req.body.roles } });
            savedUser.roles = roles.map((role) => role._id);
        } else {
            const role = await Role.findOne({ name: "user" });
            savedUser.roles = [role._id];
        }

        await savedUser.save();

        res.send({ message: "User was registered successfully!" });
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

exports.signin = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email }).populate("roles", "-__v");
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid Password!" });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 86400 });

        const authorities = user.roles.map((role) => "ROLE_" + role.name.toUpperCase());

        req.session.token = token;

        res.status(200).send({
            id: user._id,
            email: user.email,
            roles: authorities,
        });
    } catch (err) {
        res.status(500).send({ message: err });
    }
};


exports.signout = async (req, res) => {
    try {
        req.session = null;
        return res.status(200).send({ message: "You've been signed out!" });
    } catch (err) {
        this.next(err);
    }
};