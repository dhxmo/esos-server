const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { authJwt, rateLimit } = require("../middleware");

module.exports = function (app) {
    app.use(function (_, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/logout", controller.logout);

    // TODO: remove after initial register
    app.post(
        "/api/admin/register",
        controller.adminRegister
    );

    // TODO: modify rate limit to say that if the correct password, set the rate to 0 again
    app.post(
        "/api/admin/login",
        // [rateLimit],
        controller.adminLogIn
    );
    app.post("/api/user/ban/:phoneNumber", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBanUser);
    app.post("/api/user/unban/:phoneNumber", [authJwt.verifyToken, authJwt.isAdmin], controller.adminUnBanUser);

    app.post(
        "/api/ambulance/register",
        [
            authJwt.verifyToken,
            authJwt.isAdmin,
            verifySignUp.checkAmbulanceDriverDuplicateNumber
        ],
        controller.ambulanceDriverRegister
    );
    app.post("/api/ambulance/login", [rateLimit], controller.ambulanceDriverLogIn);
    app.post("/api/ambulance/logout", controller.ambulanceLogout);

    app.post("/api/user/send-otp", [rateLimit], controller.userSendOtp);
    app.post("/api/user/verify-otp", controller.userVerifyOtp);
};