const db = require('../models');
const Admin = db.admin;
const RateLimit = db.rateLimit;
const bcrypt = require('bcrypt');

exports.checkRateLimit = async (req) => {
  const phoneNumber = req.body.phoneNumber;
  const rateLimit = await RateLimit.findOne({ phoneNumber });

  if (rateLimit) {
    const elapsedTime = Date.now() - rateLimit.lastRequestTime.getTime();
    const elapsedHours = elapsedTime / 3600000;

    if (elapsedHours < 24 && rateLimit.requestCount >= 3) {
      const remainingTime = 24 - elapsedHours;
      return res.status(429).json({
        error: `Rate limit exceeded. Please try again in ${remainingTime} hours.`,
      });
    }

    await RateLimit.updateOne(
      { phoneNumber },
      { $inc: { requestCount: 1 }, lastRequestTime: Date.now() }
    );
  } else {
    await RateLimit.create({ phoneNumber });
  }
};
exports.checkAdminRateLimit = async (req) => {
  const admin = await Admin.findOne({ phoneNumber: req.body.phoneNumber });
  if (!admin) {
    throw { status: 404, message: 'Admin Not found.' };
  }

  const passwordIsValid = await bcrypt.compare(
    req.body.password,
    admin.password
  );
  if (!passwordIsValid) {
    const phoneNumber = req.body.phoneNumber;
    const rateLimit = await RateLimit.findOne({ phoneNumber });

    if (rateLimit) {
      const elapsedTime = Date.now() - rateLimit.lastRequestTime.getTime();
      const elapsedHours = elapsedTime / 3600000;

      if (elapsedHours < 24 && rateLimit.requestCount >= 3) {
        throw {
          status: 429,
          message: `Rate limit exceeded`,
        };
      }

      await RateLimit.updateOne(
        { phoneNumber },
        { $inc: { requestCount: 1 }, lastRequestTime: Date.now() }
      );
    } else {
      await RateLimit.create({ phoneNumber });
    }
  }
};
