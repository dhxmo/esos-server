const db = require('../models');
const DriverLive = db.driverLive;
const AmbulanceDriver = db.ambulanceDriver;

const jwt = require('jsonwebtoken');

require('dotenv').config();
const { JWT_SECRET } = process.env;

const { decrypt } = require('../utils/encryptToken');

const driverConnections = new Map();
const patientConnections = new Map();

const handleDriverLiveUpdate = async (message, ws, hash) => {
  // verify JWT token
  const decodedHash = decrypt(hash);
  const decodedToken = jwt.verify(decodedHash, JWT_SECRET);

  // check if the user is an ambulance driver
  try {
    const ambulanceDriver = await AmbulanceDriver.findById(decodedToken.id);
    if (!ambulanceDriver) {
      ws.close();
      throw new Error('Driver not registered1');
    }

    console.log(
      `WebSocket connection established for driver ${ambulanceDriver.phoneNumber}`
    );
    driverConnections.set(ambulanceDriver.phoneNumber, ws);

    const { driverPhone, latitude, longitude } = JSON.parse(message);

    const driver = await AmbulanceDriver.findOne({
      phoneNumber: driverPhone,
    });

    if (!driver) {
      throw new Error('Driver not registered2');
    }

    await DriverLive.findOneAndUpdate(
      { driverPhone: driverPhone },
      {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      }
    );

    console.log(`Live location updated for driver ${driverPhone}`);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  driverConnections,
  patientConnections,
  handleDriverLiveUpdate,
};
