const db = require("../models");
const DriverLive = db.driverLive;

const changeAvailability = async (driverPhone, availabilityStatus) => {
    try {
        await DriverLive.findOneAndUpdate(
            { driverPhone },
            { availability: availabilityStatus },
        );
    } catch (err) {
        console.log(err);
    }
}

module.exports = { changeAvailability }