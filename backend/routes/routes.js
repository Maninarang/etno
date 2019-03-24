const config = require('config');
const routes = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const userCtrl = require('../controllers/userController');
const authCtrl = require('../controllers/authController');
const catCtrl = require('../controllers/categoryController');
const responseHelper = require('../helpers/responseHelper');


////// ================== middleware to set custom message on unauthorized token ================//////

routes.use(function (req, res, next) {
  var token = req.token;
  if (token) {
    jwt.verify(token, config.jwtToken, function (err) {
      if (err) {
        responseHelper.unauthorized(res, err);
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

// Authentication Routes
routes.post('/login', authCtrl.login);
routes.post('/signUp', authCtrl.signUp);
routes.post('/logout/:id', authCtrl.logout);

/*
  Post Routes
*/
routes.post('/addCategory', passport.authenticate('jwt', { session: false }), catCtrl.add);



/*
  Get Routes
*/
routes.get('/viewCategories', catCtrl.view);
routes.get('/viewCategory/:id', catCtrl.viewById);


/*
  Put Routes
*/
routes.put('/changeStatus', catCtrl.changeStatus);



module.exports = routes;