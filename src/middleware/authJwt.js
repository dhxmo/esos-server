const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.user;
const Admin = db.admin;
const AmbulanceDriver = db.ambulanceDriver;
const Hospital = db.hospital;

require('dotenv').config();
const { JWT_SECRET } = process.env;

verifyToken = (req, res, next) => {
  let token = req.session.token;

  if (!token) {
    return res.status(403).send({ message: 'invalid token' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }
    req.id = decoded.id;
    next();
  });
};

isAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.id);
    if (!admin) {
      res.status(403).send({ message: 'Require Admin Role!' });
      return;
    }
    next();
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

isAmbulanceDriver = async (req, res, next) => {
  try {
    const ambulanceDriver = await AmbulanceDriver.findById(req.id);
    if (!ambulanceDriver) {
      res.status(403).send({ message: 'Require Ambulance Role!' });
      return;
    }
    next();
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

isUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.id);
    if (!user) {
      res.status(403).send({ message: 'Require User Role!' });
      return;
    }
    next();
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

isHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.id);
    if (!hospital) {
      res.status(403).send({ message: 'Require Hospital Role!' });
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
  isAmbulanceDriver,
  isUser,
  isHospital,
};
module.exports = authJwt;
