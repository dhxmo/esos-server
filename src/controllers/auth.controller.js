const {
  adminRegister,
  adminLogIn,
  adminBanUserStatus,
  adminRegisterAmbulanceDriver,
  adminRegisterHospital,
} = require('../services/admin.service');

const {
  changeDriverAvailability,
  changeHospitalAvailability,
} = require('../utils/changeAvailability');

const { userRegister } = require('../services/user.service');
const { hospitalLogIn } = require('../services/hospital.service');
const { ambulanceDriverLogIn } = require('../services/ambulanceDriver.service');

require('dotenv').config();
const { TWILIO_ACCOUNT_SID, _TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env;

const client = require('twilio')(TWILIO_ACCOUNT_SID, _TWILIO_AUTH_TOKEN);

exports.adminRegister = async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;

    const result = await adminRegister(phoneNumber, password);

    return res.status(200).json({ status: 'success', message: result });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err });
  }
};

exports.adminLogIn = async (req, res) => {
  try {
    const result = await adminLogIn(phoneNumber, password);
    req.session.token = result.token;
    return res.status(200).json({ status: 'success', message: result });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
};

exports.adminBanUser = async (req, res) => {
  try {
    const result = await adminBanUserStatus(req.params.phoneNumber, true);
    return res.status(200).json({ status: 'success', message: result });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
};

exports.adminUnBanUser = async (req, res) => {
  try {
    const result = await adminBanUserStatus(req.params.phoneNumber, false);
    return res.status(200).json({ status: 'success', message: result });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
};

exports.ambulanceDriverRegister = async (req, res) => {
  try {
    const result = adminRegisterAmbulanceDriver(
      req.body.phoneNumber,
      req.body.password,
      req.body.companyName,
      req.body.ambulanceType
    );

    return res.status(200).json({ status: 'success', message: result });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
};

exports.ambulanceDriverLogIn = async (req, res) => {
  try {
    const result = ambulanceDriverLogIn(
      req.body.phoneNumber,
      req.body.password,
      req.body.ambulanceType
    );

    req.session.token = result.token;

    return res.status(200).json({ status: 'success', message: result });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
};

exports.ambulanceLogout = async (req, res) => {
  try {
    changeDriverAvailability(req.body.phoneNumber, false);

    req.session = null;
    return res
      .status(200)
      .json({ status: 'success', message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};

exports.userSendOtp = async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    const verification = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verifications.create({
        to: `+91${phoneNumber}`,
        channel: 'sms',
      });
    return res
      .status(200)
      .json({ status: 'success', message: verification.sid });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
};

exports.userVerifyOtp = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  try {
    const verificationCheck = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: otp,
      });
    if (verificationCheck.status === 'approved') {
      const result = await userRegister(phoneNumber);

      req.session.token = result.token;
      return res.status(200).json({ status: 'success', message: result });
    }

    return res
      .status(401)
      .json({ status: 'failed', message: 'verification failed' });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
};

exports.createHospital = async (req, res) => {
  try {
    const result = await adminRegisterHospital(
      req.body.phoneNumber,
      req.body.password,
      req.body.longitude,
      req.body.latitude
    );

    return res.status(200).json({ status: 'success', message: result });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err });
  }
};

exports.hospitalLogIn = async (req, res) => {
  try {
    const result = await hospitalLogIn(req.body.phoneNumber, req.body.password);

    req.session.token = token;

    return res.status(200).json({ status: 'success', message: result });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err });
  }
};

exports.hospitalLogout = async (req, res) => {
  try {
    changeHospitalAvailability(req.body.phoneNumber, false);

    req.session = null;
    return res
      .status(200)
      .json({ status: 'success', message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};

exports.hospitalChangeAvailability = async (req, res) => {
  try {
    changeHospitalAvailability(req.body.phoneNumber, false);

    return res.status(200).json({
      status: 'success',
      message: 'Hospital availability has been changed',
    });
  } catch (err) {
    res.status(404).json({ status: 'failed', message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    req.session = null;
    return res
      .status(200)
      .json({ status: 'success', message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};
