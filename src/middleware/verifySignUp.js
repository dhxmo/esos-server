const db = require('../models');
const User = db.user;
const AmbulanceDriver = db.ambulanceDriver;
const Hospital = db.hospital;

checkDuplicateNumber = async (req, res, next) => {
  try {
    const user = await User.findOne({ phoneNumber: req.body.phoneNumber });
    if (user) {
      res
        .status(400)
        .send({ message: 'Failed! Phone number is already in use!' });
      return;
    }
    next();
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

checkAmbulanceDriverDuplicateNumber = async (req, res, next) => {
  try {
    const ambulanceDriver = await AmbulanceDriver.findOne({
      phoneNumber: req.body.phoneNumber,
    });
    if (ambulanceDriver) {
      res
        .status(400)
        .send({ message: 'Failed! Phone number is already in use!' });
      return;
    }
    next();
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

checkHospitalDuplicateNumber = async (req, res, next) => {
  try {
    const hospital = await Hospital.findOne({
      phoneNumber: req.body.phoneNumber,
    });
    if (hospital) {
      res
        .status(400)
        .send({ message: 'Failed! Phone number is already in use!' });
      return;
    }
    next();
  } catch (err) {
    res.status(500).send({ message: err });
  }
};
const verifySignUp = {
  checkDuplicateNumber,
  checkAmbulanceDriverDuplicateNumber,
  checkHospitalDuplicateNumber,
};

module.exports = verifySignUp;
