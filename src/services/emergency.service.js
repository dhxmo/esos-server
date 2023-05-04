const db = require('../models');
const { changeDriverAvailability } = require('../utils/changeAvailability');
const Emergency = db.emergency;

const { driverConnections } = require('./websocket.service');
const {
  findClosestDriver,
  findClosestHospital,
} = require('../utils/googleMaps');

exports.createEmergency = async (
  longitude,
  latitude,
  city,
  selectedAmbulanceType,
  emergency,
  userId,
  userPhone,
  closestHospital,
  selectedHospitalId
) => {
  let assignedHospital;

  const patientLocation = [longitude, latitude];

  // find closest driver and reserve for this call
  const closestDriver = await findClosestDriver(
    selectedAmbulanceType,
    patientLocation
  );

  changeDriverAvailability(
    closestDriver.driverPhone,
    closestDriver.ambulanceType,
    false
  );

  if (!closestHospital) {
    assignedHospital = selectedHospitalId;
  } else {
    assignedHospital = await findClosestHospital(patientLocation);
  }

  // create emergency call
  const request = await Emergency.create({
    location: {
      type: 'Point',
      coordinates: patientLocation,
    },
    city,
    selectedAmbulanceType,
    emergency,
    userId,
    userPhone,
    assignedDriver: closestDriver.driverPhone,
    assignedHospital,
    createdAt: new Date.now(),
  });
  await request.save();

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

  return {
    _id: request._id,
    location: {
      type: 'Point',
      coordinates: patientLocation,
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
  const emergency = await Emergency.findById(reqId);

  emergency.pickUp = true;
  emergency.pickUpAt = Date.now();
  await emergency.save();

  return `Emergency ${reqId} patient picked up`;
};
