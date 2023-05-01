const db = require('../models');
const { changeDriverAvailability } = require('../utils/changeAvailability');
const Emergency = db.emergency;
const DriverLive = db.driverLive;

const webSocketService = require('./websocket.service');

exports.createEmergency = async (
  longitude,
  latitude,
  selectedAmbulanceType,
  emergency,
  userId,
  userPhone
) => {
  // find closest driver and reserve for this call
  const closestDriver = await findClosestDriver(
    selectedAmbulanceType,
    longitude,
    latitude
  );
  console.log(closestDriver);
  changeDriverAvailability(closestDriver.driverPhone, false);

  // create emergency call
  const request = await Emergency.create({
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
    selectedAmbulanceType,
    emergency,
    userId,
    userPhone,
    assignedDriver: closestDriver.driverPhone,
  });

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

  const driverSocket = webSocketService.driverConnections.get(
    closestDriver.driverPhone
  );
  if (driverSocket) {
    driverSocket.send(JSON.stringify(notification));
    console.log(
      `Emergency alert sent to ambulance driver ${closestDriver.driverPhone}`
    );
  }

  return {
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
    selectedAmbulanceType: selectedAmbulanceType,
    userId: userId,
    userPhone: userPhone,
    assignedDriver: closestDriver.driverPhone,
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
  const emergency = await Emergency.findById(req.body.reqId);

  emergency.pickUp = true;
  emergency.pickUpAt = Date.now();
  await emergency.save();

  return `Emergency ${reqId} patient picked up`;
};

//  this is crude and simplistic. optimize this thinking of edge cases later
const findClosestDriver = async (ambulanceType, long, lat) => {
  try {
    const closestDriver = await DriverLive.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [long, lat],
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
        $limit: 1,
      },
    ]);
    console.log('in', closestDriver);
    return closestDriver[0];
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
