const { authJwt } = require('../middleware');
const controller = require('../controllers/user.controller');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.get('/api/test/all', controller.allAccess);

  app.get(
    '/api/test/user',
    [authJwt.verifyToken, authJwt.isUser],
    controller.userBoard
  );

  app.get(
    '/api/test/ambulance',
    [authJwt.verifyToken, authJwt.isAmbulanceDriver],
    controller.ambulanceDriverBoard
  );

  app.get(
    '/api/test/admin',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );

  app.get(
    '/api/users/get-user-by-id/:id',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getUserByID
  );
  app.get(
    '/api/users',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAllUsers
  );
};
