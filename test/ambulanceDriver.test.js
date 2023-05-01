const { expect } = require('chai');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const db = require('../src/models');
const AmbulanceDriver = db.ambulanceDriver;

const services = require('../src/services');
const ambulanceDriverServices = services.ambulanceDriver;

require('dotenv').config();
const { MONGODB_URI } = process.env;

describe('Hospital Functionality', () => {
  let driver;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    driver = new AmbulanceDriver({
      phoneNumber: '1234567890',
      password: await bcrypt.hash('password', 15),
      companyName: 'ABC company',
      ambulanceType: 'BLS',
    });
    await driver.save();
  });

  afterAll(async () => {
    await AmbulanceDriver.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Ambulance Driver Log In', () => {
    it('should throw an error if the driver is not found', async () => {
      try {
        await ambulanceDriverServices.ambulanceDriverLogIn(
          '1234567891',
          'password',
          'BLS'
        );
      } catch (err) {
        expect(err.message).to.equal('Ambulance driver Not found');
      }
    });

    it('should throw an error if the password is invalid', async () => {
      try {
        await ambulanceDriverServices.ambulanceDriverLogIn(
          '1234567890',
          'invalid',
          'BLS'
        );
      } catch (err) {
        expect(err.message).to.equal('Invalid Password');
      }
    });
    it('should throw an error for invalid ambulance type', async () => {
      try {
        await ambulanceDriverServices.ambulanceDriverLogIn(
          '1234567890',
          'password',
          'invalid'
        );
        throw new Error('Test failed');
      } catch (err) {
        expect(err.message).to.equal('Invalid ambulance type');
      }
    });
    it('should log in the driver successfully and return a token', async () => {
      const result = await ambulanceDriverServices.ambulanceDriverLogIn(
        '1234567890',
        'password',
        'BLS'
      );
      expect(result.message).to.equal('Logged in successfully');
      expect(result.ambulanceDriverId).to.deep.equal(driver._id);
      expect(result.token).to.exist;
      expect(result.authority).to.equal('AMBULANCE_DRIVER');
    });
  });
});
