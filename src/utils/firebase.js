const db = require('../models');
const AmbulanceDriver = db.ambulanceDriver;

var admin = require('firebase-admin');

require('dotenv').config();
const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } =
  process.env;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY,
  }),
});

exports.firebasePushNotification = async (phoneNumber) => {
  const messaging = admin.messaging();
  const driverToken = await AmbulanceDriver.findOne({ phoneNumber });

  // Send the push notification to the driver's device
  const payload = {
    data: {
      title: 'New Emergency Call',
      body: 'EMERGENCY! Get ready to serve someone in need',
      click_action: 'OPEN_EMERGENCY_CALL',
    },
    token: driverToken.jwtToken,
  };
  console.log('pay', payload);

  try {
    await messaging
      .send(payload)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
    console.log('firebase push successful');
  } catch (err) {
    console.log('firebase push failed');
    throw new Error(err);
  }
};
