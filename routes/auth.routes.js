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

    // TODO: remove once admin created 
    app.post(
        "/api/admin/register",
        controller.adminRegister
    );

    app.post(
        "/api/user/register",
        [
            verifySignUp.checkDuplicateEmail,
            verifySignUp.checkDuplicateNumber
        ],
        controller.userRegister
    );

    app.post("/api/user/login", controller.userLogIn);

    app.post("/api/user/logout", controller.logout);

    app.post(
        "/api/ambulance/register",
        [authJwt.verifyToken, authJwt.isAdmin, verifySignUp.checkAmbulanceDuplicateEmail, verifySignUp.checkAmbulanceDuplicateNumber],
        controller.ambulanceRegister
    );

    app.post("/api/ambulance/login", controller.ambulanceLogIn);

    app.post("/api/ambulance/logout", controller.logout);
};