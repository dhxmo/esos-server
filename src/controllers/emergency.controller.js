const db = require('../models');
const Emergency = db.emergency;
const Hospital = db.hospital;

const services = require('../services');
const emergencyService = services.emergency;

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

exports.getAvailableHospitals = async (req, res) => {
  const city = req.params.city;

  try {
    let h = [];
    const hospitals = await Hospital.find({
      availability: true,
      city,
    });

    for (let i = 0; i < hospitals.length; i++) {
      h.push({
        name: hospitals[i].name,
        _id: hospitals[i]._id,
      });
    }

    res.status(200).json({ status: 'success', message: h });
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
