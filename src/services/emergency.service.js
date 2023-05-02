require('dotenv').config();
const { GOOGLE_MAPS_API_KEY } = process.env;

import { Client } from '@googlemaps/google-maps-services-js';
const client = new Client({});

const googleMapsClient = require('@google/maps').createClient({
  key: GOOGLE_MAPS_API_KEY,
  Promise: Promise,
});

const db = require('../models');
const { changeDriverAvailability } = require('../utils/changeAvailability');
const Emergency = db.emergency;
const DriverLive = db.driverLive;
const Hospital = db.hospital;

const { driverConnections } = require('./websocket.service');

exports.createEmergency = async (
  longitude,
  latitude,
  selectedAmbulanceType,
  emergency,
  userId,
  userPhone,
  closestHospital
) => {
  let assignedHospital;

  // patient location
  const patientLocation = [longitude, latitude];

  // find closest driver and reserve for this call
  const closestDriver = await findClosestDriver(
    selectedAmbulanceType,
    patientLocation
  );
  console.log('clo dri', closestDriver);

  changeDriverAvailability(
    closestDriver.driverPhone,
    closestDriver.ambulanceType,
    false
  );

  // create emergency call
  const request = await Emergency.create({
    location: {
      type: 'Point',
      coordinates: patientLocation,
    },
    selectedAmbulanceType,
    emergency,
    userId,
    userPhone,
    assignedDriver: closestDriver.driverPhone,
  });
  console.log('req', request);

  // TODO: test firebase notification send
  // send push notification using firebase to get ready
  // await firebasePushNotification(closestDriver.driverPhone);

  // Find the WebSocket connection for the assigned driver
  const notification = {
    type: 'EMERGENCY_ASSIGNED',
    data: {
      requestId: request._id,
      location: {
        longitude,
        latitude,
      },
      userPhone,
    },
  };

  const driverSocket = driverConnections.get(closestDriver.driverPhone);
  if (driverSocket) {
    driverSocket.send(JSON.stringify(notification));
    console.log(
      `Emergency alert sent to ambulance driver ${closestDriver.driverPhone}`
    );
  }

  // get driver location from websocket ping for current location
  const driverLocation = [];

  if (closestHospital) {
    assignedHospital = await findClosestHospital(request._id, driverLocation);
  }

  return {
    location: {
      type: 'Point',
      coordinates: patientLocation,
    },
    selectedAmbulanceType: selectedAmbulanceType,
    userId: userId,
    userPhone: userPhone,
    assignedDriver: closestDriver.driverPhone,
    assignedHospital,
  };
};

exports.emergencyResolve = async (reqId) => {
  const emergency = await Emergency.findById(reqId);

  emergency.resolved = true;
  emergency.updatedAt = Date.now();
  await emergency.save();

  return `Emergency ${reqId} resolved`;
};

exports.emergencyConfirmPatientPickUp = async (reqId) => {
  const emergency = await Emergency.findById(reqId);

  emergency.pickUp = true;
  emergency.pickUpAt = Date.now();
  await emergency.save();

  return `Emergency ${reqId} patient picked up`;
};

const findClosestDriver = async (ambulanceType, patientLocation) => {
  try {
    const closestDrivers = await DriverLive.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: patientLocation,
          },
          distanceField: 'distance',
          spherical: true,
          query: {
            availability: true,
            ambulanceType: ambulanceType,
          },
          key: 'location',
        },
      },
      {
        $sort: {
          distance: 1,
        },
      },
      {
        $limit: 5,
      },
    ]);

    const driverMap = new Map();

    for (let i = 0; i < closestDrivers.length; i++) {
      const driver = closestDrivers[i];
      const driverLocation = driver.location.coordinates;
      const travelTime = await getTravelTime(driverLocation, patientLocation);
      driverMap.set(driver, travelTime);
    }

    const sortedDrivers = new Map(
      [...driverMap.entries()].sort((a, b) => a[1] - b[1])
    );

    return sortedDrivers.keys().next().value;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

const findClosestHospital = async (reqId, driverLocation) => {
  const closestHospitals = await Hospital.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: driverLocation,
        },
        distanceField: 'distance',
        spherical: true,
        query: {
          availability: true,
        },
        key: 'location',
      },
    },
    {
      $sort: {
        distance: 1,
      },
    },
    {
      $limit: 5,
    },
  ]);

  const hospitalMap = new Map();

  for (let i = 0; i < closestHospitals.length; i++) {
    const hospital = closestHospitals[i];
    const hospitalLocation = hospital.location.coordinates;
    const travelTime = await getTravelTime(driverLocation, hospitalLocation);
    hospitalMap.set(hospital, travelTime);
  }

  const sortedHospitals = new Map(
    [...hospitalMap.entries()].sort((a, b) => a[1] - b[1])
  );

  const assignedHospital = sortedHospitals.keys().next().value;

  const emergency = await Emergency.findById(reqId);
  emergency.assignedHospital = assignedHospital._id;
  await emergency.save();

  return assignedHospital;
};

const getTravelTime = async (startLocation, endLocation) => {
  try {
    const response = await client.distancematrix({
      params: {
        origins: [startLocation],
        destinations: [endLocation],
        mode: 'driving',
        traffic_model: 'best_guess',
        departure_time: 'now',
        key: GOOGLE_MAPS_API_KEY,
      },
      timeout: 1000, // milliseconds
    });
    const durationInTraffic =
      response.data.rows[0].elements[0].duration_in_traffic.value;

    return durationInTraffic;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

// const firebasePushNotification = async (phoneNumber) => {
//     const messaging = admin.messaging();
//     const driverToken = await AmbulanceDriver.findOne({ phoneNumber });

//     // Send the push notification to the driver's device
//     const payload = {
//         data: {
//             title: 'New Emergency Call',
//             body: 'Please get ready to serve the patient.',
//             click_action: 'OPEN_EMERGENCY_CALL'
//         },
//         token: driverToken.jwtToken
//     };
//     console.log("pay", payload);

//     await messaging.send(payload)
//         .then((response) => {
//             // Response is a message ID string.
//             console.log('Successfully sent message:', response);
//         })
//         .catch((error) => {
//             console.log('Error sending message:', error);
//         });
//     console.log("firebase push");
// }

// exports.uploadAudioToS3 = async (req, res) => {
// const emergency_id = req.body.emergencyId;
// const fileUrl = req.body.fileUrl;
// const params = {
//     Bucket: AWS_S3_BUCKET,
//     Key: fileName,
//     Body: fileContent,
// };

// const uploadResult = await s3.upload(params).promise();
// res.json({ status: "success", data: `File uploaded to S3 bucket: ${uploadResult.Location}` });
// } catch (err) {
//     res.json({ status: err });
// }
// }
