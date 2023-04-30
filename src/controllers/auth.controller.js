const db = require("../models");
const User = db.user;
const Admin = db.admin;
const AmbulanceDriver = db.ambulanceDriver;
const DriverLive = db.driverLive;
const Hospital = db.hospital;

const { adminRegister, adminLogIn } = require("../service/auth.service");

const { changeDriverAvailability, changeHospitalAvailability } = require("../utils/changeAvailability");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

require('dotenv').config()
const { JWT_SECRET, TWILIO_ACCOUNT_SID, _TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } = process.env;

const client = require('twilio')(TWILIO_ACCOUNT_SID, _TWILIO_AUTH_TOKEN);

const createAndSendToken = async (req, res, user) => {
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 86400 });
    const authority = user.role.toUpperCase();

    req.session.token = token;

    res.status(200).json({
        message: "Logged in successfully",
        token: token,
        authority: authority
    });
}

exports.adminRegister = async (req, res) => {
    try {
        const phoneNumber = req.body.phoneNumber;
        const password = req.body.password;

        const message = await adminRegister(phoneNumber, password);

        return res.status(200).send({ message });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.adminLogIn = async (req, res) => {
    try {
        const result = await adminLogIn(phoneNumber, password);
        req.session.token = result.token;
        res.status(200).json(result);
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

exports.adminBanUser = async (req, res) => {
    try {
        const filter = { phoneNumber: req.params.phoneNumber };
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
        const filter = { phoneNumber: req.params.phoneNumber };
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

exports.ambulanceDriverRegister = async (req, res) => {
    try {
        // register driver
        const ambulanceDriver = new AmbulanceDriver({
            phoneNumber: req.body.phoneNumber,
            password: await bcrypt.hash(req.body.password, 15),
            companyName: req.body.companyName,
            ambulanceType: req.body.ambulanceType,
            jwtToken: req.body.jwtToken
        });

        await ambulanceDriver.save();

        //  create new driver live location entry
        const driverLive = new DriverLive({
            driverPhone: req.body.phoneNumber,
            availability: false,
            location: {
                type: 'Point',
                coordinates: [0, 0]
            }
        });
        await driverLive.save();

        return res.send({ message: "Ambulance driver was registered successfully!" });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.ambulanceDriverLogIn = async (req, res) => {
    try {
        //  validate password
        let ambulanceDriver = await AmbulanceDriver.findOne({ phoneNumber: req.body.phoneNumber });
        if (!ambulanceDriver) {
            return res.status(404).send({ message: "Ambulance driver Not found." });
        }

        const passwordIsValid = bcrypt.compare(req.body.password, ambulanceDriver.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid Password!" });
        }

        //  make driver available
        changeDriverAvailability(req.body.phoneNumber, req.body.ambulanceType, true);

        //  give jwt
        const token = jwt.sign({ id: ambulanceDriver.id }, JWT_SECRET, { expiresIn: 86400 });
        const authority = ambulanceDriver.role.toUpperCase();

        ambulanceDriver = await AmbulanceDriver.findOneAndUpdate(
            { phoneNumber: req.body.phoneNumber },
            { jwtToken: token }
        );
        await ambulanceDriver.save();

        req.session.token = token;

        res.status(200).json({
            message: "Logged in successfully",
            token: token,
            authority: authority
        });
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

exports.ambulanceLogout = async (req, res) => {
    try {
        changeDriverAvailability(req.body.phoneNumber, false);

        req.session = null;
        return res.status(200).send({ message: "You've been signed out!" });
    } catch (err) {
        this.next(err);
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

                    createAndSendToken(req, res, user);
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

exports.createHospital = async (req, res) => {
    try {
        const hospital = new Hospital({
            phoneNumber: req.body.phoneNumber,
            password: await bcrypt.hash(req.body.password, 15),
            location: {
                type: 'Point',
                coordinates: [Number(req.body.longitude), Number(req.body.latitude)]
            }
        });

        await hospital.save();

        return res.send({ message: "Hospital was registered successfully!" });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.hospitalLogIn = async (req, res) => {
    try {
        //  validate password
        let hospital = await Hospital.findOne({ phoneNumber: req.body.phoneNumber });
        if (!hospital) {
            return res.status(404).send({ message: "Hospital Not found." });
        }

        const passwordIsValid = bcrypt.compare(req.body.password, hospital.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid Password!" });
        }

        //  make hospital available
        changeHospitalAvailability(req.body.phoneNumber, true);

        //  give jwt
        createAndSendToken(req, res, hospital)
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

exports.hospitalLogout = async (req, res) => {
    try {
        changeHospitalAvailability(req.body.phoneNumber, false);

        req.session = null;
        return res.status(200).send({ message: "You've been signed out!" });
    } catch (err) {
        this.next(err);
    }
};

exports.hospitalChangeAvailability = async (req, res) => {
    try {
        changeHospitalAvailability(req.body.phoneNumber, false);

        return res.status(200).json({ status: "success", data: "Hospital availability has been changed" });
    } catch (err) {
        res.status(404).json({ status: "failed", data: err });
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
