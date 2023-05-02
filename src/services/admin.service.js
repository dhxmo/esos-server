const db = require('../models');
const User = db.user;
const Admin = db.admin;
const AmbulanceDriver = db.ambulanceDriver;
const DriverLive = db.driverLive;
const Hospital = db.hospital;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.adminRegister = async (phoneNumber, password) => {
  const admin = new Admin({
    phoneNumber: phoneNumber,
    password: await bcrypt.hash(password, 15),
  });

  await admin.save();

  return 'Admin was registered successfully!';
};

exports.adminLogIn = async (phoneNumber, password) => {
  const admin = await Admin.findOne({ phoneNumber });
  if (!admin) {
    throw new Error('Admin not found.');
  }

  const passwordIsValid = await bcrypt.compare(password, admin.password);
  if (!passwordIsValid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
    expiresIn: 86400,
  });
  const authority = admin.role.toUpperCase();

  return {
    message: 'Logged in successfully',
    adminId: admin._id,
    token,
    authority,
  };
};

exports.adminBanUserStatus = async (phoneNumber, banStatus) => {
  const filter = { phoneNumber };
  const update = { banned: banStatus };
  const result = await User.updateMany(filter, update);

  return result;
};

exports.adminRegisterAmbulanceDriver = async (
  phoneNumber,
  password,
  companyName,
  ambulanceType
) => {
  // register driver
  const ambulanceDriver = new AmbulanceDriver({
    phoneNumber,
    password: await bcrypt.hash(password, 15),
    companyName,
    ambulanceType,
    jwtToken: phoneNumber,
  });

  await ambulanceDriver.save();

  //  create new driver live location entry
  const driverLive = new DriverLive({
    driverPhone: phoneNumber,
    availability: false,
    location: {
      type: 'Point',
      coordinates: [0, 0],
    },
  });
  await driverLive.save();

  return 'Ambulance was registered successfully';
};

exports.adminRegisterHospital = async (
  name,
  phoneNumber,
  password,
  longitude,
  latitude
) => {
  const hospital = new Hospital({
    name,
    phoneNumber,
    password: await bcrypt.hash(password, 15),
    location: {
      type: 'Point',
      coordinates: [Number(longitude), Number(latitude)],
    },
  });

  await hospital.save();

  return 'Hospital was registered successfully';
};
