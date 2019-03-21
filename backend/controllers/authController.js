const config = require('config');
const db = require('../db/db');
const jwt = require('jsonwebtoken');
const common = require('../helpers/common');
const hashPassword = require('../helpers/hashPassword');
const responseHelper = require('../helpers/responseHelper');
const filesUpload = require('../helpers/uploadFiles').uploadFile;

const Users = db.models.users;

module.exports = {
//////============================= Login Function ===============================//////
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return responseHelper.unauthorized(res, 'Please Enter email and password');
      }

      const user = await Users.findOne({
        attributes : ['id','email','password','roleId'],
        where: {
          email: email,
          roleId: 1
        }
      });

      if (user) {
        const getUser = user.toJSON();
        const match = await hashPassword.comparePass(password, getUser.password);

        // compare pwd
        if (!match) {
          return responseHelper.onError(res, 'Invalid Password', 'Invalid Password');
        }

        const credentials = {
          id: getUser.id,
         // password: getUser.password,
          email: getUser.email
        };

        const token = jwt.sign(credentials, config.jwtToken, { algorithm: 'HS256', expiresIn: '1h' });

        getUser.token = token;
        // remove password,email and roleId from response
        delete getUser.password;
        delete getUser.email;
        delete getUser.roleId;
        return responseHelper.get(res,'User Detail',getUser);
      }

      return responseHelper.get(res, 'Invalid User','Invalid User');
    } catch (e) {
      console.log('Error => ', e);
      return responseHelper.get(res, 'Error',e);
    }
  },
  ///////////////////////////////   Logout user /////////////////////////////////////
  logout: async (req, res) => {
    try {
      const data = req.params;
      const logout = await Users.update({ device_token: '', device_type: 0 }, {
        where: {
          id: data.id
        }
      });
      if (logout) {
        return responseHelper.get(res, 'logout sucessfull', {})

      }
    } catch (e) {
      return responseHelper.onError(res, e, 'Error while logout');
    }
  },

 //////================================ user signup =================================///////
  signUp: async (req, res) => {
    const data = req.body;
    try {
      req.checkBody('email', 'email is required').notEmpty();
      req.checkBody('email', 'valid email is required').isEmail();
      req.checkBody('password', 'password is required').notEmpty();
     // req.checkBody('phoneNumber', 'phone number is required').notEmpty();
      //req.checkBody('phoneNumber', 'phone number should be integer').isInt();
      req.checkBody('roleId', 'role id is required').notEmpty();
      req.checkBody('roleId', 'role id should be integer').isInt();

      const error = req.validationErrors();
      if (error) {
        responseHelper.onError(res, '', error[0].msg);
        return;
      }
      const user = await Users.findOne({
        where: {
          email: data.email
        }
      });

      if (!user) {
        const pswd = await hashPassword.generatePass(data.password);
        data.password = pswd;

        const users = await Users.create(data);

        if (users) {
          const userId = users.dataValues.id;
          data.userId = userId;
          // const otp = common.generateOpt();
          // const otp = 1111;
          // data.otp = otp;


          const credentials = {
            id: userId,
            email: users.dataValues.email
          };

          const token = jwt.sign(credentials, config.jwtToken, { algorithm: 'HS256' });
          const userdetails = {};
          userdetails.email = users.dataValues.email;
          userdetails.token = token;
          userdetails.id = userId;

          return responseHelper.post(res, userdetails);
        }

      } else {
        responseHelper.onError(res, '', 'User already exists');
      }

    } catch (e) {
      return responseHelper.onError(res, e, 'Error while creating a user');
    }

  },

}