const db = require("../models");
const RateLimit = db.rateLimit;
const Admin = db.admin;

exports.rateLimitMiddleware = async (req, res, next) => {
    try {
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

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.adminRateLimitMiddleware = async (req, res, next) => {
    const admin = await Admin.findOne({ phoneNumber: req.body.phoneNumber });
    if (!admin) {
        return res.status(404).send({ message: "Admin Not found." });
    }

    const passwordIsValid = await bcrypt.compare(req.body.password, admin.password);
    if (!passwordIsValid) {
        return res.status(401).send({ message: "Invalid Password!" });
    }

    if (!passwordIsValid) {
        try {
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

            next();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    next();
}

// module.exports = { rateLimitMiddleware, adminRateLimitMiddleware }