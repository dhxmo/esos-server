const db = require('../models');
const Hospital = db.hospital;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { changeHospitalAvailability } = require('../utils/changeAvailability');

require('dotenv').config();
const { JWT_SECRET } = process.env;

exports.hospitalLogIn = async (phoneNumber, password) => {
  const hospital = await Hospital.findOne({
    phoneNumber,
  });
  if (!hospital) {
    throw new Error('Hospital Not found');
  }

  const passwordIsValid = bcrypt.compare(password, hospital.password);
  if (!passwordIsValid) {
    throw new Error('Invalid Password');
  }

  //  make hospital available
  changeHospitalAvailability(phoneNumber, true);

  //  give jwt
  const token = jwt.sign({ id: hospital.id }, JWT_SECRET, { expiresIn: 86400 });
  const authority = hospital.role.toUpperCase();

  return {
    message: 'Logged in successfully',
    hospitalId: hospital._id,
    token: token,
    authority: authority,
  };
};
