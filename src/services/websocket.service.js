const db = require('../models');
const DriverLive = db.driverLive;
const AmbulanceDriver = db.ambulanceDriver;
const User = db.user;

const jwt = require('jsonwebtoken');

require('dotenv').config();
const { JWT_SECRET } = process.env;

const { decrypt } = require('../utils/encryptToken');

const driverConnections = new Map();
const patientConnections = new Map();

const handleChatMessages = async (message, ws, hash) => {
  // verify JWT token
  const decodedHash = decrypt(hash);
  const decodedToken = jwt.verify(decodedHash, JWT_SECRET);

  try {
    const signedInUser = await User.findById(decodedToken.id);
    if (!signedInUser) {
      ws.close();
      throw new Error('Not a valid user');
    }
    // establish connection and store WebSocket connection for the driver
    console.log(
      `WebSocket connection established for user ${signedInUser.phoneNumber}`
    );
    patientConnections.set(signedInUser.phoneNumber, ws);

    const recipientWs = driverConnections.get(message.recipientPhone);
    if (recipientWs) {
      // get the audio data as a base64-encoded string
      const audioData = await message.recording.blob.readAsStringAsync();

      recipientWs.send(
        JSON.stringify({
          senderPhone: signedInUser.phoneNumber,
          text: message.text,
          audioData,
        })
      );
    } else {
      ws.send(JSON.stringify({ error: `Recipient \${recipientId} not found` }));
    }
  } catch (err) {
    console.error(err);
    ws.send(JSON.stringify({ error: err }));
  }
};

const handleDriverLiveUpdate = async (message, ws, hash) => {
  // verify JWT token
  const decodedHash = decrypt(hash);
  const decodedToken = jwt.verify(decodedHash, JWT_SECRET);

  // check if the user is an ambulance driver
  try {
    const ambulanceDriver = await AmbulanceDriver.findById(decodedToken.id);
    if (!ambulanceDriver) {
      ws.close();
      throw new Error('Not a registered driver');
    }

    console.log(
      `WebSocket connection established for driver ${ambulanceDriver.phoneNumber}`
    );
    driverConnections.set(ambulanceDriver.phoneNumber, ws);

    if (message.driverPhone == ambulanceDriver.phoneNumber) {
      const driver = await AmbulanceDriver.findOne({
        phoneNumber: message.driverPhone,
      });

      if (!driver) {
        throw new Error('Driver not registered');
      }

      await DriverLive.findOneAndUpdate(
        { driverPhone: message.driverPhone },
        {
          location: {
            type: 'Point',
            coordinates: [message.longitude, message.latitude],
          },
        }
      );

      console.log(`Live location updated for driver ${message.driverPhone}`);
    } else {
      throw new Error('Only allowed to updated your own location');
    }
  } catch (err) {
    throw err;
  }
};

module.exports = {
  driverConnections,
  patientConnections,
  handleDriverLiveUpdate,
  handleChatMessages,
};
