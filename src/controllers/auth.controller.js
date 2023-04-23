const db = require("../models");
const User = db.user;
const Admin = db.admin;
const Ambulance = db.ambulance;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

require('dotenv').config()
const { JWT_SECRET, TWILIO_ACCOUNT_SID, _TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } = process.env;

const client = require('twilio')(TWILIO_ACCOUNT_SID, _TWILIO_AUTH_TOKEN);

const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    max: 3,
    message: 'You have exceeded the 3 requests in 24 hrs limit!',
    keyGenerator: function (req) {
        return req.body.phoneNumber;
    },
    skip: function (req) {
        return !req.body.phoneNumber;
    }
});


async function createAndSendToken(req, res, user) {
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 86400 });
    const authority = user.role.toUpperCase();

    req.session.token = token;

    res.status(200).json({
        message: "Logged in successfully",
        token: token,
        authority: authority
    });
}
// TODO: remove once admin is registered
exports.adminRegister = async (req, res) => {
    try {
        const phoneNumber = `+91${req.body.phoneNumber}`;

        const admin = new Admin({
            phoneNumber: phoneNumber,
            password: await bcrypt.hash(req.body.password, 15),
        });

        await admin.save();

        return res.send({ message: "Admin was registered successfully!" });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.adminLogIn = async (req, res) => {
    try {
        const admin = await Admin.findOne({ phoneNumber: `+91${req.body.phoneNumber}` });
        if (!admin) {
            return res.status(404).send({ message: "Admin Not found." });
        }

        const passwordIsValid = await bcrypt.compare(req.body.password, admin.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid Password!" });
        }
        createAndSendToken(req, res, admin)
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

exports.adminBanUser = async (req, res) => {
    try {
        const filter = { phoneNumber: `+91${req.params.phoneNumber}` };
        const update = { banned: true };
        const result = await User.updateMany(filter, update);

        if (result.nModified === 0) {
            return res.status(404).json({ error: 'No users found' });
        }

        res.status(200).json({ message: 'Users banned successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.adminUnBanUser = async (req, res) => {
    try {
        const filter = { phoneNumber: `+91${req.params.phoneNumber}` };
        const update = { banned: false };
        const result = await User.updateMany(filter, update);

        if (result.nModified === 0) {
            return res.status(404).json({ error: 'No users found' });
        }

        res.status(200).json({ message: 'User unbanned successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.ambulanceRegister = async (req, res) => {
    try {
        const ambulance = new Ambulance({
            phoneNumber: `+91${req.body.phoneNumber}`,
            password: await bcrypt.hash(req.body.password, 15),
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
        const ambulance = await Ambulance.findOne({ phoneNumber: `+91${req.body.phoneNumber}` });
        if (!ambulance) {
            return res.status(404).send({ message: "Ambulance Not found." });
        }

        const passwordIsValid = await bcrypt.compare(req.body.password, ambulance.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid Password!" });
        }

        createAndSendToken(req, res, ambulance);
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

exports.userSendOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        const verification = await client.verify.v2.services(TWILIO_SERVICE_SID).verifications.create({
            to: `+91${phoneNumber}`,
            channel: 'sms',
        });
        res.json({ success: true, data: verification.sid });
    } catch (err) {
        res.json({ success: false, data: err });
    }
}


exports.userVerifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;
    try {
        const verificationCheck = await client.verify.v2.services(TWILIO_SERVICE_SID).verificationChecks.create({
            to: `+91${phoneNumber}`,
            code: otp,
        });
        if (verificationCheck.status === 'approved') {
            console.log('OTP verification successful');
            const user = await User.findOne({ phoneNumber: `+91${phoneNumber}` });

            if (!user) {
                try {
                    const user = new User({
                        phoneNumber: `+91${phoneNumber}`
                    });

                    await user.save();

                    createAndSendToken(req, res, user)
                } catch (err) {
                    return res.json({ success: false });
                }
            } else {
                if (user.banned === true) {
                    return res.status(401).send({ message: "Banned number. You're not allowed on this platform. Contact admin to revoke ban" });
                }
                createAndSendToken(req, res, user)
            }

        } else {
            res.json({ success: false });
        }
    } catch (err) {
        console.error(err);
        res.json({ success: false });
    }

}

exports.logout = async (req, res) => {
    try {
        req.session = null;
        return res.status(200).send({ message: "You've been signed out!" });
    } catch (err) {
        this.next(err);
    }
};
