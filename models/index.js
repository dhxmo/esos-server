const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.emergency = require("./emergency.model")
db.ambulance = require("./ambulance.model")

db.ROLES = ["user", "admin", "ambulance"];

module.exports = db;