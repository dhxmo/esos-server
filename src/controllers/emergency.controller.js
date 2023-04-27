const db = require("../models");
const Emergency = db.emergency;
const DriverLive = db.driverLive;
// const Recording = db.audioRecord;

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
    try {
        // find closest driver
        const closestDriver = await findClosestDriver(Number(req.body.longitude), Number(req.body.latitude));
        console.log(closestDriver);


        //  update driver availability
        const driver = await DriverLive.findOneAndUpdate(
            { driverPhone: closestDriver.driverPhone },
            { availability: false }
        );
        await driver.save();

        // create emergency call
        const request = await Emergency.create({
            location: {
                type: 'Point',
                coordinates: [req.body.longitude, req.body.latitude]
            },
            selected: req.body.selected,
            emergency: req.body.emergency,
            userId: req.id,
            userPhone: req.body.userPhone,
            assignedDriver: closestDriver.driverPhone
        });

        // - send push notification using firebase to get ready
        //  - use google maps API to route fastest path b/w patient lat/long and ambulance driver's lat/long
        // - update ambulance client with path and destination

        res.json({ data: request, status: "success" });
    } catch (err) {
        res.json({ status: err });
    }
};

//  this is crude and simplistic. optimize this thinking of edge cases later
const findClosestDriver = async (long, lat) => {
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

        return closestDriver[0];
    } catch (err) {
        console.log(err);
        throw err
    }
};



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