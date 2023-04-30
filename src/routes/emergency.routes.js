const emergencyControllers = require("../controllers/emergency.controller");
const { authJwt } = require("../middleware");
const verifyUserState = require("../middleware/verifyUserState");

module.exports = function (app) {
    app.use(function (_, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/emergency/create", [
        authJwt.verifyToken,
        authJwt.isUser,
        verifyUserState.checkBannedUser
    ], emergencyControllers.createEmergency);

    app.patch("/api/emergency/confirm-pick-up", [
        authJwt.verifyToken,
        authJwt.isAmbulanceDriver
    ], emergencyControllers.confirmPatientPickUp);

    app.patch("/api/emergency/resolved", [
        authJwt.verifyToken,
        authJwt.isAmbulanceDriver
    ], emergencyControllers.resolveEmergency);

    app.patch("/api/emergency/available-hospitals", [
        authJwt.verifyToken,
        authJwt.isAmbulanceDriver
    ], emergencyControllers.findClosestAvailableHospital);

    app.post("/api/hospital/see-inbound-emergencies", [
        authJwt.verifyToken,
        authJwt.isHospital
    ],
        emergencyControllers.seeActiveEmergencies)

    // app.post("/api/emergency/audio", [
    //     authJwt.verifyToken,
    //     authJwt.isUser,
    //     verifyUserState.checkBannedUser
    // ], emergencyControllers.uploadAudioToS3);

    app.get("/api/emergency/get-all", [
        authJwt.verifyToken,
        authJwt.isAdmin
    ], emergencyControllers.getAllEmergencies);

    app.get("/api/emergency/get/:id", [
        authJwt.verifyToken,
        authJwt.isAdmin
    ], emergencyControllers.getEmergencyById);

};