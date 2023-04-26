const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.admin = require("./admin.model");
db.user = require("./user.model");
db.emergency = require("./emergency.model")
db.ambulanceDriver = require("./ambulance.model")
db.rateLimit = require("./rateLimit.model")
db.audioRecord = require("./audioRecording.model")
db.driverLive = rquire("./driverLive.model.js")

module.exports = db;