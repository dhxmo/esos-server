const {
  checkAdminRateLimit,
  checkRateLimit,
} = require('../services/rateLimit.service');

exports.rateLimitMiddleware = async (req, res, next) => {
  try {
    await checkRateLimit(req);
    next();
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.adminRateLimitMiddleware = async (req, res, next) => {
  try {
    await checkAdminRateLimit(req);
    next();
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message });
  }
};
