const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { authJwt } = require("../middleware");

module.exports = function (app) {
    app.use(function (_, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/logout", controller.logout);

    app.post(
        "/api/admin/register",
        controller.adminRegister
    );
    app.post(
        "/api/admin/login",
        controller.adminLogIn
    );
    app.post("/api/user/ban/:phoneNumber", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBanUser);
    app.post("/api/user/unban/:phoneNumber", [authJwt.verifyToken, authJwt.isAdmin], controller.adminUnBanUser);

    app.post(
        "/api/ambulance/register",
        [authJwt.verifyToken, authJwt.isAdmin, verifySignUp.checkAmbulanceDuplicateNumber],
        controller.ambulanceRegister
    );
    app.post("/api/ambulance/login", controller.ambulanceLogIn);

    app.post("/api/user/send-otp", controller.userSendOtp);
    app.post("/api/user/verify-otp", controller.userVerifyOtp);
};