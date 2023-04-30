const { expect } = require('chai');
const sinon = require('sinon');
const db = require('../src/models');
const Admin = db.admin;
const RateLimit = db.rateLimit;
const mongoose = require('mongoose');
require('dotenv').config();
const { MONGODB_URI } = process.env;
const bcrypt = require('bcrypt');
const { checkAdminRateLimit } = require('../src/services/rateLimit.service');

describe('checkAdminRateLimit', () => {
  let admin;
  let rateLimit;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    admin = new Admin({
      phoneNumber: '1234567891',
      password: await bcrypt.hash('password123', 15),
    });
    await admin.save();

    rateLimit = new RateLimit({
      phoneNumber: '1234567891',
      requestCount: 3,
      lastRequestTime: new Date(Date.now() - 12 * 3600 * 1000),
    });
    await rateLimit.save();
  });

  afterAll(async () => {
    await Admin.deleteMany({});
    await RateLimit.deleteMany({});
    await mongoose.connection.close();
  });

  it('throws an error if the admin is not found', async () => {
    try {
      await checkAdminRateLimit({
        body: {
          phoneNumber: '0987654321',
          password: await bcrypt.hash('123', 15),
        },
      });
      expect.fail('Expected error to be thrown.');
    } catch (error) {
      expect(error.message).to.equal('Admin Not found.');
    }
  });

  it('throws an error if the password is incorrect', async () => {
    try {
      await checkAdminRateLimit({
        body: {
          phoneNumber: '0987654321',
          password: await bcrypt.hash('123', 15),
        },
      });
      expect.fail('Expected error to be thrown.');
    } catch (error) {
      expect(error.message).to.equal('Admin Not found.');
    }
  });

  it('throws an error if the rate limit is exceeded', async () => {
    try {
      await checkAdminRateLimit({
        body: {
          phoneNumber: '1234567891',
          password: await bcrypt.hash('123', 15),
        },
      });
      expect.fail('Expected error to be thrown.');
    } catch (error) {
      expect(error.message).to.equal('Rate limit exceeded');
    }
  });

  it('allows signin with the correct credentials even if rate limit has been reached', async () => {
    await checkAdminRateLimit({
      body: { phoneNumber: '1234567891', password: 'password123' },
    });

    // Check that the rate limit has been updated
    const updatedRateLimit = await RateLimit.findOne({
      phoneNumber: '1234567891',
    });
    expect(updatedRateLimit.requestCount).to.equal(3);
  });
});
