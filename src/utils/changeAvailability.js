const db = require("../models");
const DriverLive = db.driverLive;
const Hospital = db.hospital;

const changeDriverAvailability = async (driverPhone, availabilityStatus) => {
    try {
        await DriverLive.findOneAndUpdate(
            { driverPhone },
            { availability: availabilityStatus },
        );
    } catch (err) {
        console.log(err);
    }
}
const changeHospitalAvailability = async (hospitalPhone, availabilityStatus) => {
    try {
        await Hospital.findOneAndUpdate(
            { hospitalPhone },
            { availability: availabilityStatus },
        );
    } catch (err) {
        console.log(err);
    }
}

module.exports = { changeDriverAvailability, changeHospitalAvailability };