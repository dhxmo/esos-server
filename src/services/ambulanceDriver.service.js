const db = require('../models');
const AmbulanceDriver = db.ambulanceDriver;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { changeDriverAvailability } = require('../utils/changeAvailability');

require('dotenv').config();
const { JWT_SECRET } = process.env;

exports.ambulanceDriverLogIn = async (phoneNumber, password, ambulanceType) => {
  if (!['ALS', 'BLS'].includes(ambulanceType)) {
    throw new Error('Invalid ambulance type');
  }

  //  validate password
  let ambulanceDriver = await AmbulanceDriver.findOne({
    phoneNumber,
  });
  if (!ambulanceDriver) {
    throw new Error('Ambulance driver Not found');
  }

  const passwordIsValid = bcrypt.compare(password, ambulanceDriver.password);
  if (!passwordIsValid) {
    throw new Error('Invalid Password');
  }

  //  make driver available
  changeDriverAvailability(phoneNumber, ambulanceType, true);

  //  give jwt
  const token = jwt.sign({ id: ambulanceDriver.id }, JWT_SECRET, {
    expiresIn: 86400,
  });
  const authority = ambulanceDriver.role.toUpperCase();

  ambulanceDriver = await AmbulanceDriver.findOneAndUpdate(
    { phoneNumber },
    { jwtToken: token }
  );
  await ambulanceDriver.save();

  return {
    message: 'Logged in successfully',
    ambulanceDriverId: ambulanceDriver._id,
    token: token,
    authority: authority,
  };
};
