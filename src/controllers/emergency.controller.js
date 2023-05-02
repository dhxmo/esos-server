const db = require('../models');

const services = require('../services');
const webSocketService = services.websocket;
const emergencyService = services.emergency;

const Emergency = db.emergency;
const DriverLive = db.driverLive;
const Hospital = db.hospital;
// const AmbulanceDriver = db.ambulanceDriver;
// const Recording = db.audioRecord;

const { changeDriverAvailability } = require('../utils/changeAvailability');
// const { admin } = require('../utils/firebase');

// const AWS = require('aws-sdk');
// const fetch = require('node-fetch');
// require("dotenv").config()
// const { AWS_S3_BUCKET, AWS_SECRET_ACCESS_KEY, AWS_ACCESS_ID } = process.env;

// const s3 = new AWS.S3({
//     accessKeyId: AWS_ACCESS_ID,
//     secretAccessKey: AWS_SECRET_ACCESS_KEY,
// })

exports.createEmergency = async (req, res) => {
  const long = Number(req.body.longitude);
  const lat = Number(req.body.latitude);

  try {
    const result = await emergencyService.createEmergency(
      long,
      lat,
      req.body.city,
      req.body.selectedAmbulanceType,
      req.body.emergency,
      req.id,
      req.body.userPhone,
      req.body.closestHospital
    );
    return res.status(200).json({ status: 'success', message: result });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err });
  }
};

exports.getEmergencyById = async (req, res) => {
  try {
    const request = await Emergency.findById(req.params.id);
    res.status(200).json({ status: 'success', message: request });
  } catch (err) {
    res.status(500).json({ status: 'failed', message: err });
  }
};

exports.getAllEmergencies = async (_, res) => {
  try {
    const requests = await Emergency.find();
    res.status(200).json({ status: 'success', message: requests });
  } catch (err) {
    res.status(500).json({ status: 'failed', message: err });
  }
};

exports.confirmPatientPickUp = async (req, res) => {
  try {
    const result = await emergencyService.emergencyConfirmPatientPickUp(
      req.body.requestId
    );
    return res.status(200).json({ status: 'success', message: result });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err });
  }
};

//  TODO: for patients who want to select a specific hospital
// exports.findClosestAvailableHospital = async (req, res) => {
//   try {

//     res.json({ status: 'success', data: assignedHospital.location });
//   } catch (err) {
//     res.json({ status: err });
//   }
// };

exports.getAvailableHospitals = async (req, res) => {
  const city = req.body.city;

  try {
    const hospitals = await Hospital.find({
      availability: true,
      city,
    });
    res.status(200).json({ status: 'success', message: hospitals });
  } catch (err) {
    res.status(500).json({ status: 'failed', message: err });
  }
};

exports.resolveEmergency = async (req, res) => {
  try {
    const result = await emergencyService.emergencyResolve(req.body.reqId);
    return res.status(200).json({ status: 'success', message: result });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err });
  }
};

exports.seeActiveInboundEmergencies = async (req, res) => {
  try {
    const hospitals = await Emergency.find({ assignedHospital: req.id });
    res.status(200).json({ status: 'success', message: hospitals });
  } catch (err) {
    res.status(500).json({ status: 'failed', message: err });
  }
};
