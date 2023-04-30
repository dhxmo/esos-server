const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { authJwt, rateLimitMiddleware, adminRateLimitMiddleware } = require("../middleware");

module.exports = function (app) {
    app.use(function (_, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/logout", controller.logout);

    // ******** TODO: remove after initial register *********
    app.post(
        "/api/admin/register",
        controller.adminRegister
    );

    app.post(
        "/api/admin/login",
        [adminRateLimitMiddleware],
        controller.adminLogIn
    );

    app.patch("/api/user/ban/:phoneNumber", [
        authJwt.verifyToken,
        authJwt.isAdmin
    ], controller.adminBanUser);
    app.patch("/api/user/unban/:phoneNumber", [
        authJwt.verifyToken,
        authJwt.isAdmin
    ], controller.adminUnBanUser);

    app.post(
        "/api/ambulance/register",
        [
            authJwt.verifyToken,
            authJwt.isAdmin,
            verifySignUp.checkAmbulanceDriverDuplicateNumber
        ],
        controller.ambulanceDriverRegister
    );
    app.post("/api/ambulance/login", [rateLimitMiddleware], controller.ambulanceDriverLogIn);
    app.post("/api/ambulance/logout", controller.ambulanceLogout);

    app.post("/api/user/send-otp", [rateLimitMiddleware], controller.userSendOtp);
    app.post("/api/user/verify-otp", controller.userVerifyOtp);

    app.post("/api/hospital/register", [
        authJwt.verifyToken,
        authJwt.isAdmin,
        verifySignUp.checkHospitalDuplicateNumber
    ], controller.createHospital);
    app.post("/api/hospital/login", [rateLimitMiddleware], controller.hospitalLogIn);
    app.patch("/api/hospital/change-availability", [
        rateLimitMiddleware,
        authJwt.verifyToken,
        authJwt.isHospital
    ], controller.hospitalChangeAvailability);

};