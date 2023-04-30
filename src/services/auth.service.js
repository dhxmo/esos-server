const db = require("../models");
// const User = db.user;
const Admin = db.admin;

const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");

exports.adminRegister = async (phoneNumber, password) => {
    const admin = new Admin({
        phoneNumber: phoneNumber,
        password: await bcrypt.hash(password, 15),
    });

    await admin.save();

    return "Admin was registered successfully!";
};

exports.adminLogIn = async (phoneNumber, password) => {
    const admin = await Admin.findOne({ phoneNumber });
    if (!admin) {
        throw new Error('Admin not found.');
    }

    const passwordIsValid = await bcrypt.compare(password, admin.password);
    if (!passwordIsValid) {
        throw new Error('Invalid password');
    }

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: 86400 });
    const authority = admin.role.toUpperCase();

    return {
        message: 'Logged in successfully',
        adminId: admin._id,
        token,
        authority,
    };
};