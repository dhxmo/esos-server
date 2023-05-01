const { expect } = require('chai');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const db = require('../src/models');
const Hospital = db.hospital;

const { hospitalLogIn } = require('../src/services/hospital.service');

require('dotenv').config();
const { MONGODB_URI } = process.env;

describe('Hospital Functionality', () => {
  let hospital;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    hospital = new Hospital({
      phoneNumber: '0000123456',
      password: await bcrypt.hash('password', 15),
      location: {
        type: 'Point',
        coordinates: [12.054, 11.354],
      },
    });
    await hospital.save();
  });

  afterAll(async () => {
    await Hospital.deleteMany({});
    await mongoose.connection.close();
  });

  describe('hospitalLogIn', () => {
    it('should log in a hospital with correct credentials', async () => {
      const phoneNumber = '0000123456';
      const password = 'password';

      const result = await hospitalLogIn(phoneNumber, password);

      expect(result).to.have.property('message', 'Logged in successfully');
      expect(result).to.have.property('hospitalId');
      expect(result.hospitalId).to.deep.equal(hospital._id);
      expect(result).to.have.property('token');
      expect(result).to.have.property('authority');
    });

    it('should throw an error for an invalid phone number', async () => {
      const phoneNumber = '0000000000';
      const password = 'password';

      try {
        await hospitalLogIn(phoneNumber, password);
      } catch (error) {
        expect(error.message).to.equal('Hospital Not found');
      }
    });

    it('should throw an error for an invalid password', async () => {
      const phoneNumber = '0000123456';
      const password = 'wrongpassword';

      try {
        await hospitalLogIn(phoneNumber, password);
      } catch (error) {
        expect(error.message).to.equal('Invalid Password');
      }
    });
  });
});
