const controller = require('../controllers/auth.controller');
const {
  verifySignUp,
  authJwt,
  rateLimitMiddleware,
  adminRateLimitMiddleware,
} = require('../middleware');

module.exports = function (app) {
  app.use(function (_, res, next) {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.post('/api/logout', controller.logout);

  // Admin functionalities
  // ******** TODO: remove after initial register *********
  app.post('/api/admin/register', controller.adminRegister);
  app.post(
    '/api/admin/login',
    [adminRateLimitMiddleware],
    controller.adminLogIn
  );
  app.post(
    '/api/ambulance/register',
    [
      authJwt.verifyToken,
      authJwt.isAdmin,
      verifySignUp.checkAmbulanceDriverDuplicateNumber,
    ],
    controller.ambulanceDriverRegister
  );
  app.post(
    '/api/hospital/register',
    [
      authJwt.verifyToken,
      authJwt.isAdmin,
      verifySignUp.checkHospitalDuplicateNumber,
    ],
    controller.createHospital
  );
  app.patch(
    '/api/user/ban/:phoneNumber',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBanUser
  );
  app.patch(
    '/api/user/unban/:phoneNumber',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminUnBanUser
  );

  // Ambulance Driver functionality
  app.post(
    '/api/ambulance/login',
    [rateLimitMiddleware],
    controller.ambulanceDriverLogIn
  );
  app.post('/api/ambulance/logout', controller.ambulanceLogout);

  //  User functionality
  app.post('/api/user/send-otp', [rateLimitMiddleware], controller.userSendOtp);
  // TODO: add some kind of rate limit here that doesnt duplicate entry into above table
  app.post('/api/user/verify-otp', controller.userVerifyOtp);

  // Hospital functionality
  app.post(
    '/api/hospital/login',
    [rateLimitMiddleware],
    controller.hospitalLogIn
  );
  app.patch(
    '/api/hospital/change-availability',
    [rateLimitMiddleware, authJwt.verifyToken, authJwt.isHospital],
    controller.hospitalChangeAvailability
  );
};
