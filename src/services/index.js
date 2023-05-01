const services = {};

services.admin = require('./admin.service');
services.ambulanceDriver = require('./ambulanceDriver.service');
services.hospital = require('./hospital.service');
services.rateLimit = require('./rateLimit.service');
services.user = require('./user.service');
services.websocket = require('./websocket.service');

module.exports = services;
