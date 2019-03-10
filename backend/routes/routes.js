const config = require('config');
const routes = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const userCtrl = require('../controllers/userController');
const authCtrl = require('../controllers/authController');
const responseHelper = require('../helpers/responseHelper');


////// ================== middleware to set custom message on unauthorized token ================//////

routes.use(function(req, res, next) {
    var token =  req.token;
    if (token) {
      jwt.verify(token, config.jwtToken, function(err) {
          if (err) {
            return responseHelper.unauthorized(res, err);
         // return res.status(401).json({ success: false, message: err });
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

 routes.post('/logout/:id',authCtrl.logout);

/*
  Post Routes
*/



/*
  Get Routes
*/
routes.get('/users', passport.authenticate('jwt', { session: false }), userCtrl.getUserList);







/*
  Put Routes
*/



module.exports = routes;