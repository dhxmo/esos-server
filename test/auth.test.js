const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const db = require("../src/models")
const Admin = db.admin;

require('dotenv').config();
const { MONGODB_URI } = process.env;

const { registerAdmin } = require('../src/services/auth.services');


describe('Auth Services', () => {
    beforeAll(async () => {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Admin service', () => {
        it('registers an admin in the database', async () => {
            const phoneNumber = '1234567890';
            const password = 'password123';

            const result = await registerAdmin(phoneNumber, password);

            expect(result).to.equal('Admin was registered successfully!');

            const admin = await Admin.findOne({ phoneNumber });

            // expect(admin).to.be.();
            expect(await bcrypt.compare(password, admin.password)).to.equal(true);
        });
    });

})
