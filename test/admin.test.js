const { expect } = require('chai');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const db = require('../src/models');
const Admin = db.admin;
const User = db.user;
const AmbulanceDriver = db.ambulanceDriver;
const DriverLive = db.driverLive;
const Hospital = db.hospital;

require('dotenv').config();
const { MONGODB_URI } = process.env;

const {
  adminRegister,
  adminLogIn,
  adminBanUserStatus,
  adminRegisterAmbulanceDriver,
  adminRegisterHospital,
} = require('../src/services/admin.service');

describe('Admin Functionality', () => {
  let admin, adminId, phoneNumber, user;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    admin = new Admin({
      phoneNumber: '1234567890',
      password: await bcrypt.hash('password123', 15),
    });
    await admin.save();
    adminId = admin._id;

    phoneNumber = '0000000001';
    user = new User({
      phoneNumber,
    });
    await user.save();
  });

  afterAll(async () => {
    await Admin.deleteMany({});
    await User.deleteMany({});
    await DriverLive.deleteMany({});
    await AmbulanceDriver.deleteMany({});
    await Hospital.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Admin service', () => {
    it('registers an admin in the database', async () => {
      const phoneNumber = '1234567890';
      const password = 'password123';

      const result = await adminRegister(phoneNumber, password);

      expect(result).to.equal('Admin was registered successfully!');

      const admin = await Admin.findOne({ phoneNumber });

      expect(await bcrypt.compare(password, admin.password)).to.equal(true);
    });

    it('returns the admin if the credentials are valid', async () => {
      const result = await adminLogIn('1234567890', 'password123');
      expect(result.adminId).to.deep.equal(adminId);
    });

    it('returns an error if the phone number is not found', async () => {
      try {
        await adminLogIn('0987654321', 'password123');
        expect.fail('Expected error to be thrown.');
      } catch (error) {
        expect(error.message).to.equal('Admin not found.');
      }
    });

    it('returns an error if the password is incorrect', async () => {
      try {
        await adminLogIn('1234567890', 'wrongpassword');
        expect.fail('Expected error to be thrown.');
      } catch (error) {
        expect(error.message).to.equal('Invalid password');
      }
    });

    it('should update to status banned of a user', async () => {
      let p = '0000000001';
      await adminBanUserStatus(p, true);

      const userBanned = await User.findOne({ phoneNumber: p });
      expect(userBanned.banned).to.equal(true);
    });

    it('should update to status unbanned of a user', async () => {
      let p = '0000000001';
      await adminBanUserStatus(p, false);

      const userBanned = await User.findOne({ phoneNumber: p });
      expect(userBanned.banned).to.equal(false);
    });

    it('should register a new ambulance driver and create a new driver live location entry', async () => {
      const phoneNumber = '0000000003';
      const password = 'password';
      const companyName = 'Test Company';
      const ambulanceType = 'BLS';

      // Call the service function
      await adminRegisterAmbulanceDriver(
        phoneNumber,
        password,
        companyName,
        ambulanceType
      );

      // Check if the ambulance driver was registered
      const registeredDriver = await AmbulanceDriver.findOne({ phoneNumber });
      expect(registeredDriver).to.exist;
      expect(registeredDriver.companyName).to.equal(companyName);
      expect(registeredDriver.ambulanceType).to.equal(ambulanceType);
      expect(registeredDriver.jwtToken).to.equal(phoneNumber);

      // Check if the driver live location entry was created
      const driverLive = await DriverLive.findOne({ driverPhone: phoneNumber });
      expect(driverLive).to.exist;
      expect(driverLive.availability).to.be.false;
      expect(driverLive.location.type).to.equal('Point');
      expect(driverLive.location.coordinates).to.deep.equal([0, 0]);

      // Check if the password was hashed before saving
      const passwordIsValid = await bcrypt.compare(
        password,
        registeredDriver.password
      );
      expect(passwordIsValid).to.be.true;
    });

    it('should register a hospital', async () => {
      const phoneNumber = '0000123456';
      const password = 'password';
      const longitude = '12.345';
      const latitude = '10.765';

      const result = await adminRegisterHospital(
        phoneNumber,
        password,
        longitude,
        latitude
      );

      expect(result).to.equal('Hospital was registered successfully');

      const hosp = await Hospital.findOne({ phoneNumber });
      expect(hosp).to.exist;
      expect(hosp.availability).to.be.true;
      expect(hosp.location.type).to.equal('Point');
      expect(hosp.location.coordinates).to.deep.equal([
        Number(longitude),
        Number(latitude),
      ]);

      const passwordIsValid = await bcrypt.compare(password, hosp.password);
      expect(passwordIsValid).to.be.true;
    });
  });
});
