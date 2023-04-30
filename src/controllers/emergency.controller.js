const db = require("../models");
const Emergency = db.emergency;
const DriverLive = db.driverLive;
const Hospital = db.hospital;
// const AmbulanceDriver = db.ambulanceDriver;
// const Recording = db.audioRecord;
const { driverConnections } = require('../websockets')

const { changeDriverAvailability } = require("../utils/changeAvailability");
// const { admin } = require('../utils/firebase');

// const AWS = require('aws-sdk');
// const fetch = require('node-fetch');
// require("dotenv").config()
// const { AWS_S3_BUCKET, AWS_SECRET_ACCESS_KEY, AWS_ACCESS_ID } = process.env;

// const s3 = new AWS.S3({
//     accessKeyId: AWS_ACCESS_ID,
//     secretAccessKey: AWS_SECRET_ACCESS_KEY,
// })

exports.getAllEmergencies = async (_, res) => {
    try {
        const requests = await Emergency.find();
        res.json({ data: requests, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createEmergency = async (req, res) => {
    const long = Number(req.body.longitude);
    const lat = Number(req.body.latitude);

    try {
        // find closest driver and reserve for this call
        const closestDriver = await findClosestDriver(req.body.selectedAmbulanceType, long, lat);
        changeDriverAvailability(closestDriver.driverPhone, false);

        // create emergency call
        const request = await Emergency.create({
            location: {
                type: 'Point',
                coordinates: [long, lat]
            },
            selectedAmbulanceType: req.body.selectedAmbulanceType,
            emergency: req.body.emergency,
            userId: req.id,
            userPhone: req.body.userPhone,
            assignedDriver: closestDriver.driverPhone
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
                    longitude: long,
                    latitude: lat,
                },
                userPhone: userPhone
            }
        };

        const driverSocket = driverConnections.get(closestDriver.driverPhone);
        if (driverSocket) {
            driverSocket.send(JSON.stringify(notification));
            console.log(`Emergency alert sent to ambulance driver ${closestDriver.driverPhone}`);
        }

        res.json({ data: request, status: "success" });
    } catch (err) {
        res.json({ status: err });
    }
};

//  this is crude and simplistic. optimize this thinking of edge cases later
const findClosestDriver = async (ambulanceType, long, lat) => {
    try {
        const closestDriver = await DriverLive.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [long, lat]
                    },
                    distanceField: 'distance',
                    spherical: true,
                    query: {
                        availability: true,
                        ambulanceType: ambulanceType,
                    },
                    key: 'location'
                },
            },
            {
                $sort: {
                    distance: 1
                }
            },
            {
                $limit: 1
            },
        ])
        console.log(closestDriver[0]);
        return closestDriver[0];
    } catch (err) {
        console.log(err);
        throw new Error(err)
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

exports.getEmergencyById = async (req, res) => {
    try {
        const request = await Emergency.findById(req.params.id);
        res.json({ data: request, status: "success" });
    } catch (err) {
        res.json({ status: err });
    }
};

exports.resolveEmergency = async (req, res) => {
    try {
        const emergency = await Emergency.findById(req.body.reqId);

        emergency.resolved = true;
        emergency.updatedAt = Date.now();
        await emergency.save()

        res.json({ status: "success" });
    } catch (err) {
        res.json({ status: err });
    }

}

exports.confirmPatientPickUp = async (req, res) => {
    try {
        const emergency = await Emergency.findById(req.body.reqId);

        emergency.pickUp = true;
        emergency.pickUpAt = Date.now();
        await emergency.save()

        res.json({ status: "success" });
    } catch (err) {
        res.json({ status: err });
    }
}

//TODO: this is crude and simplistic. make this such that it collates real time traffic data
//  and finds the hospital which can be reached in the least time 
exports.findClosestAvailableHospital = async (req, res) => {
    const { reqId, longitude, latitude } = req.body;
    try {
        const closestHospital = await Hospital.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [Number(longitude), Number(latitude)]
                    },
                    distanceField: 'distance',
                    spherical: true,
                    query: {
                        availability: true
                    },
                    key: 'location'
                },
            },
            {
                $sort: {
                    distance: 1
                }
            },
            {
                $limit: 1
            },
        ])
        const assignedHospital = closestHospital[0];

        const emergency = await Emergency.findById(reqId);
        emergency.assignedHospital = assignedHospital._id;
        await emergency.save();

        res.json({ status: "success", data: assignedHospital.location });
    } catch (err) {
        res.json({ status: err });
    }
}

//  function to allow a hospital to see it's own inbound emergencies
exports.seeActiveEmergencies = async (req, res) => {

}