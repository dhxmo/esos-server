require('dotenv').config();
const { GOOGLE_MAPS_API_KEY } = process.env;

import { Client } from '@googlemaps/google-maps-services-js';
const client = new Client({});

const db = require('../models');
const DriverLive = db.driverLive;
const Hospital = db.hospital;

exports.findClosestDriver = async (ambulanceType, patientLocation) => {
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

exports.findClosestHospital = async (patientLocation) => {
  try {
    const closestHospitals = await Hospital.aggregate([
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
      const travelTime = await getTravelTime(patientLocation, hospitalLocation);
      hospitalMap.set(hospital, travelTime);
    }

    const sortedHospitals = new Map(
      [...hospitalMap.entries()].sort((a, b) => a[1] - b[1])
    );

    const assignedHospital = sortedHospitals.keys().next().value;

    return assignedHospital._id;
  } catch (err) {
    throw new Error(err);
  }
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
