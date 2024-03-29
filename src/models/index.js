const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.admin = require('./admin.model');
db.user = require('./user.model');
db.emergency = require('./emergency.model');
db.ambulanceDriver = require('./ambulanceDriver.model');
db.rateLimit = require('./rateLimit.model');
db.driverLive = require('./driverLive.model.js');
db.hospital = require('./hospitals.model');

module.exports = db;
