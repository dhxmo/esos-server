const db = require("../models");
const User = db.user;
const Admin = db.admin;


const bcrypt = require("bcryptjs");

exports.registerAdmin = async (phoneNumber, password) => {
    const admin = new Admin({
        phoneNumber: phoneNumber,
        password: await bcrypt.hash(password, 15),
    });

    await admin.save();

    return "Admin was registered successfully!";
};