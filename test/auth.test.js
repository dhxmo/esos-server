const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const db = require("../src/models")
const Admin = db.admin;
const RateLimit = db.rateLimit;

require('dotenv').config();
const { MONGODB_URI } = process.env;

const { adminRegister, adminLogIn } = require('../src/services/auth.service');


describe('Auth Services', () => {
    let admin;
    let adminId;

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
    });

    afterAll(async () => {
        await Admin.deleteMany({});
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

    });

})