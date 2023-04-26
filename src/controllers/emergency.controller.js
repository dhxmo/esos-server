const db = require("../models");
const { ambulanceSearchAndDeploy } = require("../utils/ambulanceSearchAndDeploy");
const Emergency = db.emergency;
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
        const request = await Emergency.create({
            location: {
                type: 'Point',
                coordinates: [req.body.longitude, req.body.latitude]
            },
            selected: req.body.selected,
            emergency: req.body.emergency,
            userId: req.id,
            userPhone: req.body.userPhone
        });
        res.json({ data: request, status: "success" });

        await ambulanceSearchAndDeploy();
    } catch (err) {
        res.json({ status: err });
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