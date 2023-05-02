const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const { MONGODB_URI } = process.env;

const db = require('../src/models');
const AmbulanceDriver = db.ambulanceDriver;
const DriverLive = db.driverLive;

const services = require('../src/services');
const webSocketService = services.websocket;

// const { WebSocketService } = require('../src/services/websocket.service');
const { encrypt } = require('../src/utils/encryptToken');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('WebSocketService', () => {
  describe('handleDriverLiveUpdate', () => {
    let ws, ambulanceDriver, hash, newDriverLive;

    beforeAll(async () => {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      ws = {
        send: () => {},
        close: () => {},
        on: () => {},
      };
      ambulanceDriver = new AmbulanceDriver({
        phoneNumber: '555-9876',
        password: 'password',
        ambulanceType: 'BLS',
        companyName: 'ABC company',
      });

      await ambulanceDriver.save();

      newDriverLive = new DriverLive({
        driverPhone: ambulanceDriver.phoneNumber,
        ambulanceType: ambulanceDriver.ambulanceType,
        location: {
          type: 'Point',
          coordinates: [0, 0],
        },
      });

      await newDriverLive.save();

      hash = encrypt(
        jwt.sign({ id: ambulanceDriver._id }, process.env.JWT_SECRET)
      );
    });
    afterAll(async () => {
      await AmbulanceDriver.deleteMany({});
      await DriverLive.deleteMany({});
      await mongoose.connection.close();
    });
    it('should update the driver location', async () => {
      const message = JSON.stringify({
        driverPhone: ambulanceDriver.phoneNumber,
        latitude: 40.7128,
        longitude: -74.006,
      });

      await webSocketService.handleDriverLiveUpdate(message, ws, hash);

      const updatedDriverLive = await DriverLive.findOne({
        driverPhone: ambulanceDriver.phoneNumber,
      });

      expect(updatedDriverLive.location.type).to.equal('Point');
      expect(updatedDriverLive.location.coordinates[0]).to.equal(-74.006);
      expect(updatedDriverLive.location.coordinates[1]).to.equal(40.7128);
    });

    it('should throw an error if the driver is not registered', async () => {
      const message = JSON.stringify({
        driverPhone: '555-5678',
        latitude: 40.7128,
        longitude: -74.006,
      });

      await expect(
        webSocketService.handleDriverLiveUpdate(message, ws, hash)
      ).to.be.rejectedWith('Only allowed to updated your own location');
    });

    it('should throw an error if the JWT token is invalid', async () => {
      const message = JSON.stringify({
        driverPhone: ambulanceDriver.phoneNumber,
        latitude: 40.7128,
        longitude: -74.006,
      });
      hash =
        'b5a5c7ebd27535c0018ee874995460ed145d0994019e5cd1e8fa9d7587e56198be1f8eb4075881191976744c7adfb8314d9b6976585f40094b0a858157936268dc1e37c1cdb031e9cd4dfc25d51376fc0358e4ee6920738b3ae9c6ac852b0be921b90827c835db6f9092213872e4ed80529c157ec34d7c3c9c6681ba80fec65a23b2039117291ac0ead080a8f023c4bfa55598517e47ca8c33199e108af065fe1200f5b85cc8ee19a71fe32c1ca69229';

      await expect(
        webSocketService.handleDriverLiveUpdate(message, ws, hash)
      ).to.be.rejectedWith('invalid token');
    });
  });
});
