const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const { MONGODB_URI } = process.env;

const db = require('../src/models');
const AmbulanceDriver = db.ambulanceDriver;
const DriverLive = db.driverLive;
const Emergency = db.emergency;

const services = require('../src/services');
const emergencyService = services.emergency;

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Emergency Service', () => {
  let ambulanceDriver, newDriverLive, ambulanceDriver2, newDriverLive2;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // ws = {
    //     send: () => { },
    //     close: () => { },
    //     on: () => { },
    // };
    ambulanceDriver = new AmbulanceDriver({
      phoneNumber: '555-1234',
      password: 'password',
      ambulanceType: 'ALS',
      companyName: 'ABC company',
    });

    await ambulanceDriver.save();

    newDriverLive = new DriverLive({
      driverPhone: ambulanceDriver.phoneNumber,
      ambulanceType: ambulanceDriver.ambulanceType,
      location: {
        type: 'Point',
        coordinates: [12.956091, 77.720996],
      },
    });

    await newDriverLive.save();

    ambulanceDriver2 = new AmbulanceDriver({
      phoneNumber: '555-1233',
      password: 'password',
      ambulanceType: 'ALS',
      companyName: 'ABC company',
    });

    await ambulanceDriver2.save();

    newDriverLive2 = new DriverLive({
      driverPhone: ambulanceDriver2.phoneNumber,
      ambulanceType: ambulanceDriver2.ambulanceType,
      location: {
        type: 'Point',
        coordinates: [12.956081, 77.720994],
      },
    });

    await newDriverLive2.save();
  });
  afterAll(async () => {
    await AmbulanceDriver.deleteMany({});
    await DriverLive.deleteMany({});
    await mongoose.connection.close();
  });

  describe('createEmergency', () => {
    // TODO: uncomment when any changes to create emergency, till then keep commented
    //  google api expensive and we broke fam
    // it('should create an emergency', async () => {
    //   const longitude = 12.961509;
    //   const latitude = 77.709673;
    //   const selectedAmbulanceType = 'ALS';
    //   const emergency = true;
    //   const userId = '12334567';
    //   const userPhone = '555-4321';
    //   await emergencyService.createEmergency(
    //     longitude,
    //     latitude,
    //     selectedAmbulanceType,
    //     emergency,
    //     userId,
    //     userPhone,
    //     false
    //   );
    //   const createdEmergency = await Emergency.findOne({
    //     userId,
    //   });
    //   expect(createdEmergency).to.exist;
    //   expect(createdEmergency.location.type).to.equal('Point');
    //   expect(createdEmergency.location.coordinates[0]).to.equal(longitude);
    //   expect(createdEmergency.location.coordinates[1]).to.equal(latitude);
    //   expect(createdEmergency.selectedAmbulanceType).to.equal(
    //     selectedAmbulanceType
    //   );
    //   expect(createdEmergency.emergency).to.equal(emergency);
    //   expect(createdEmergency.userId).to.equal(userId);
    //   expect(createdEmergency.userPhone).to.equal(userPhone);
    //   expect(createdEmergency.assignedDriver).to.equal(
    //     ambulanceDriver2.phoneNumber
    //   );
    //   expect(createdEmergency.resolved).to.equal(false);
    // });
    // TODO:
    // it('should create an emergency and send websocket message to assigned driver', async () => { });
  });
});
