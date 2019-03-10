const responseHelper = require('../helpers/responseHelper');
const db = require('../db/db');
const sequelize = require('sequelize');
const config = require('config');
const common = require('../helpers/common');
const crypto = require('crypto');
const filesUpload = require('./uploadController').uploadFile;

const Users = db.models.users;



// const Roles = db.models.roles;
// const UserDetails = db.models.userDetails;
// const Reviews = db.models.reviews;
// const Friends = db.models.friends;
// const ReportUser = db.models.reportUser;

// Users.hasMany(Posts,{ foreignKey: 'userId'});
// Users.hasMany(Chats);
// Users.hasOne(chatConstant);

//Users.hasOne(UserDetails, { foreignKey: 'id' });

//Roles.hasMany(Users, { foreignKey: 'roleId' });
// UserDetails.belongsTo(Users, { foreignKey: 'userId' });

module.exports = {

/////////////////////////////// Update User Profile //////////////////////////////////////////
profileUpdate: async (req, res) => {
  const data = req.body;
  //console.log(data)
  try {
    req.checkHeaders('security_key').notEmpty().withMessage('security_key is required').equals(config.securityKey).withMessage('security key not matched');
    req.checkBody('name', 'name is required').notEmpty();
    req.checkBody('mobile_number', 'mobile_number is required').notEmpty();
    req.checkBody('mobile_number', 'mobile_number should be integer').isInt();
    req.checkBody('country_code', 'country_code is required').notEmpty();
    req.checkBody('country_code', 'country_code should be integer').isInt();
    req.checkBody('id', 'id is required').notEmpty();
   // req.checkBody('id', 'id should be integer').isInt();

    const error = req.validationErrors();
    if (error) {
      responseHelper.onError(res, '', error[0].msg);
      return;
    }
    const user = await Users.findOne({
      attributes : ['id'],
      where: {
        id: data.id
      }
    });
    if (!user) {
      responseHelper.onError(res, '', 'User does not exists');
    } else {
      let imagename = '';
      if(req.body.image) {
        if(data.image.length< 50) {
        imagename = data.image
        } else {
      const name = data.ext;
      const file = data.image.split(' ').join('+');
      const unique = uuidv1();
      const newFilename = (`${unique}.${name}`);
      await filesUpload(file, newFilename, 'users');
      imagename = newFilename
      }
    }
      data.profile_image = imagename;
      data.device_type = req.headers.device_type;
      data.device_token = req.headers.device_token
      data.mobile = data.mobile_number;
      data.mobile_with_country_code = data.country_code + data.mobile_number;
      data.updated = common.timestamp();
      const current_date = (new Date()).valueOf().toString();
      const random = Math.random().toString();
      data.authorization_key = crypto.createHash('sha1').update(current_date + random).digest('hex');
      const users = await Users.update(
        data,
        {
       where: {
        id: data.id
        }
      });

      if (users) {

        return responseHelper.post(res , 'user updated successfully', {
          id:  user.dataValues.id,
          name: data.name,
          profile_image: data.profile_image,
          mobile_with_country_code : data.mobile_with_country_code.toString(),
          authorization_key: data.authorization_key
        });
      }
    }

  } catch (e) {
    return responseHelper.onError(res, e, 'Error while updating  user');
  }
  },
//////////////////////// check if my contacts exists in app or not /////////////////////
  myUsers: async (req, res) => {
    try {
      req.checkHeaders('security_key').notEmpty().withMessage('security_key is required').equals(config.securityKey).withMessage('security key not matched');
      req.checkHeaders('authorization_key', 'authorization_key is required').notEmpty();
      req.checkBody('mobile_with_country_code', 'mobile_with_country_code').notEmpty();
      req.checkBody('user_id', 'user_id is required').notEmpty();
      req.checkBody('user_id', 'user_id should be integer').isInt();

      const error = req.validationErrors();
      if (error) {
        responseHelper.onError(res, '', error[0].msg);
        return;
      }
      const data = req.body;
      const users = await Users.findAll({
        attributes : [
        'id' , 'name', 'profile_image', ['last_online_date','time'], 'status','country_code','mobile','mobile_with_country_code',
       // [sequelize.fn('IFNULL', sequelize.col('last_online_date'), ''), 'time'],
         /////////// below literal is to check if user has blocked other user or not, if not then check whether they are friends or not /////////
        [sequelize.literal(`IF(EXISTS(SELECT id FROM blocked_users WHERE user_id =  ${data.user_id} AND blocked_id = users.id), 2, IFNULL( (SELECT friends FROM chat_constants WHERE (sender =  ${data.user_id} AND  receiver = users.id) OR (sender = users.id AND receiver = ${data.user_id})),0))`),'friends']
      ],
        where: {
          id: {
            $ne: data.user_id
          },

          $or: [
                {
                  mobile_with_country_code: {$in:[data.mobile_with_country_code]}
                },
                {
                  mobile:{$in:[data.mobile_with_country_code]}
                }
               ]
        },
        order: [
          [sequelize.literal(`(SELECT count(message) from chats where ((sender= ${data.user_id} AND receiver = users.id) OR (sender=users.id AND receiver = ${data.user_id})))`),'DESC'] ////////////// this is done to get frequent users on top

        ]
      });
 // Users.sequelize.query("SELECT `id`, `name`, `status`, last_online_date AS `time`, IFNULL(`profile_image`, '') AS `profile_image`, `country_code`, `mobile`, `mobile_with_country_code` FROM `users` AS `users` WHERE `users`.`id` != " + data.user_id + " AND (`users`.`mobile_with_country_code` IN (" + data.mobile_with_country_code + ") OR `users`.`mobile` IN (" + data.mobile_with_country_code + "))",
      //   { type: sequelize.QueryTypes.SELECT }
      // ).then(function (users) {
        if (users.length > 0) {

          return responseHelper.get(res, 'user list', users)

        } else {
          return responseHelper.get(res, 'no users', [])

        }
    } catch (e) {
      return responseHelper.onError(res, e, 'Error while fetching list');
    }
  },


///////////////////////////////////////////////// my friends /////////////////////////////////////////////////////////////////
myFriends: async (req, res) => {
  try {
    req.checkHeaders('security_key').notEmpty().withMessage('security_key is required').equals(config.securityKey).withMessage('security key not matched');
    req.checkParams('userId', 'user_id is required').notEmpty();

    const error = req.validationErrors();
    if (error) {
      responseHelper.onError(res, '', error[0].msg);
      return;
    }
    const data = req.params;
    const users = await Users.findAll({
      attributes : [
      'id' , 'name', 'profile_image', ['last_online_date','time'], 'status','country_code','mobile','mobile_with_country_code',
     // [sequelize.fn('IFNULL', sequelize.col('last_online_date'), ''), 'time'],
       /////////// below literal is to check if user has blocked other user or not, if not then check whether they are friends or not /////////
     [sequelize.literal(`IF(EXISTS(SELECT id FROM blocked_users WHERE user_id =  ${data.userId} AND blocked_id = users.id), 2, IFNULL( (SELECT friends FROM chat_constants WHERE (sender =  ${data.userId} AND  receiver = users.id) OR (sender = users.id AND receiver = ${data.userId})),0))`),'friends']
    ],

      where: {
        id: {
          $ne: data.userId
        },
      },
        include: [
          {
            model: chatConstant,
            attributes: [],
            on: {
              $or : {
              col1: sequelize.where(sequelize.col('users.id'), '=', sequelize.col('chat_constant.sender')),
              col2: sequelize.where(sequelize.col("users.id"), "=", sequelize.col('chat_constant.receiver'))
               }
             },
             where: {
               $and : [ {
                 friends : 1,

              $or: [
                    {
                      sender: {$eq:[data.userId]}
                    },
                    {
                      receiver:{$eq:[data.userId]}
                    }
                   ]
                  }
                ]
            },
            required : true                ///////// i dont understand why sequelize using inner join by default in this function

          },
        ],
      order: [
        [sequelize.literal(`(SELECT count(message) from chats where ((sender= ${data.userId} AND receiver = users.id) OR (sender=users.id AND receiver = ${data.userId})))`),'DESC'] ////////////// this is done to get frequent users on top

      ]
    });
// Users.sequelize.query("SELECT `id`, `name`, `status`, last_online_date AS `time`, IFNULL(`profile_image`, '') AS `profile_image`, `country_code`, `mobile`, `mobile_with_country_code` FROM `users` AS `users` WHERE `users`.`id` != " + data.user_id + " AND (`users`.`mobile_with_country_code` IN (" + data.mobile_with_country_code + ") OR `users`.`mobile` IN (" + data.mobile_with_country_code + "))",
    //   { type: sequelize.QueryTypes.SELECT }
    // ).then(function (users) {
      if (users.length > 0) {

        return responseHelper.get(res, 'Friends list', users)

      } else {
        return responseHelper.get(res, 'no friends', [])

      }
  } catch (e) {
    return responseHelper.onError(res, e, 'Error while fetching list');
  }
},





///////////////////////////////////  search user by name ///////////////////////////////////

searchUser: async (req, res) => {
  try {
    req.checkHeaders('security_key').notEmpty().withMessage('security_key is required').equals(config.securityKey).withMessage('security key not matched');
    req.checkParams('myId', 'userId is required').notEmpty();

    const error = req.validationErrors();
    if (error) {
      responseHelper.onError(res, '', error[0].msg);
      return;
    }
    const data = req.query;
    const users = await Users.findAll({
      attributes: [
        'id','name','profile_image',['last_online_date','time'],'status','country_code','mobile','mobile_with_country_code',
        [sequelize.literal(`IF(EXISTS(SELECT id FROM blocked_users WHERE user_id =  ${req.params.myId} AND blocked_id = users.id), 2, IFNULL( (SELECT friends FROM chat_constants WHERE (sender =  ${req.params.myId} AND  receiver = users.id) OR (sender = users.id AND receiver = ${req.params.myId})),0))`),'friends'],
      [sequelize.literal(`IF( EXISTS(SELECT id from chat_constants where (sender= ${req.params.myId} and receiver = users.id) or (sender = users.id and receiver = ${req.params.myId})), (SELECT id from chat_constants where  (sender= ${req.params.myId} and receiver = users.id) or (sender = users.id and receiver = ${req.params.myId})), 0)`),'chat_constant_id']

    ],
      where: {
        name: {
          $like: data.name + '%'
        },
        id:  {
        $ne : req.params.myId
        }
      }
    });
    if(users) {
      return responseHelper.get(res,'User List',users)
    } else {
      return responseHelper.get(res,'User List',[])
    }
   }
  catch(e) {
    return responseHelper.onError(res,'Error while finding people',e);

  }

},


///////////////////////////////////  view other user Profile ///////////////////////////////////

userProfile: async (req, res) => {
  try {
    req.checkHeaders('security_key').notEmpty().withMessage('security_key is required').equals(config.securityKey).withMessage('security key not matched');
    req.checkParams('myId', 'your Id is required').notEmpty();
    req.checkParams('userId', 'user id is required').notEmpty();


    const error = req.validationErrors();
    if (error) {
      responseHelper.onError(res, '', error[0].msg);
      return;
    }
    const data = req.query;

    const users = await Users.findOne({
      attributes: [
        'id','name','profile_image','last_online_date','status','country_code','mobile','mobile_with_country_code',
    ],
      where: {
        id:  {
        $eq : req.params.userId
        }
      },
      include: [
            {
              model: Posts,
              attributes: ['media', 'mediaType','thumbnail', 'postType',['createdAt','time']],
              where: {
                userId:  {
                $eq : req.params.userId
                }
              },
              $order: [
                'id', 'DESC'
              ],
              required : false                ///////// i dont understand why sequelize using inner join by default in this function

            },
            {
              model: Chats,
              on: {
               $or : {
               col1: sequelize.where(sequelize.col('users.id'), '=', sequelize.col('chats.sender')),
               col2: sequelize.where(sequelize.col("users.id"), "=", sequelize.col('chats.receiver'))
                }
              },
              attributes: ['message_type','media', 'thumbnail',['created','time']],
              where: {
                $and: [
                  {
                    $or: [
                      {
                        message_type: 2
                      },
                      {
                       message_type: 3
                      }
                     ]
                  },
                  {
                    $or: [
                      {
                        sender: req.params.userId,
                        receiver: req.params.myId
                      },
                      {
                        sender: req.params.myId,
                        receiver : req.params.userId
                      }
                     ]
                  }
                ]
              },
              $order: [
                'id', 'DESC'
              ],
              required : false                ///////// i dont understand why sequelize using inner join by default in this function
           }
        ],
    });

    if(users) {
      return responseHelper.get(res,'User Data',users)
    } else {
      return responseHelper.get(res,'User Data',[])
    }
  }
  catch(e) {
    return responseHelper.onError(res,'Error while fetching detail',e);

  }

},



///////////////////////////////////  view own Profile ///////////////////////////////////

myProfile: async (req, res) => {
  try {
    req.checkHeaders('security_key').notEmpty().withMessage('security_key is required').equals(config.securityKey).withMessage('security key not matched');
    req.checkParams('myId', 'your Id is required').notEmpty();


    const error = req.validationErrors();
    if (error) {
      responseHelper.onError(res, '', error[0].msg);
      return;
    }

    const user = await Users.findOne({
      attributes: [
        'id','name','profile_image','last_online_date','status','country_code','mobile','mobile_with_country_code',
    ],
      where: {
        id:  {
        $eq : req.params.myId
        }
      },
      include: [
            {
              model: Posts,
              attributes: ['media','mediaType', 'thumbnail', 'postType',['createdAt','time']],
              where: {
                userId:  {
                $eq : req.params.myId
                }
              },
              required : false                ///////// i dont understand why sequelize using inner join by default in this function

            },
            {
              model: Chats,
              on: {
               $or : {
               col1: sequelize.where(sequelize.col('users.id'), '=', sequelize.col('chats.sender')),
               col2: sequelize.where(sequelize.col("users.id"), "=", sequelize.col('chats.receiver'))
                }
              },
              attributes: ['message_type','media', 'thumbnail',['created','time']],
              where: {
                $and: [
                  {
                    $or: [
                      {
                        message_type: 2
                      },
                      {
                       message_type: 3
                      }
                     ]
                  },
                  {
                    $or: [
                      {
                        receiver: req.params.myId
                      },
                      {
                        sender: req.params.myId,
                      }
                     ]
                  }
                ]
              },
              required : false                ///////// i dont understand why sequelize using inner join by default in this function
           }
        ],
    });

    if(user) {
      return responseHelper.get(res,'User Detail',user)
    } else {
      return responseHelper.get(res,'User Detail',{})
    }
  }
  catch(e) {
    return responseHelper.onError(res,'Error while fetching detail',e);

  }

},


getUserList: async (req, res) => {

  res.send('hi')
}

  // deleteUserImage: async (req, res) => {
  //   const { userId } = req.params;
  //   await UserDetails.update({ image: '' }, {
  //     where: {
  //       userId
  //     }
  //   });
  //   return responseHelper.put(res, 1);
  // },


  // delete: async (req, res) => {
  //   const { userId } = req.params;
  //   await UserDetails.update({ isActive: 0 }, {
  //     where: {
  //       userId
  //     }
  //   });
  //   return responseHelper.del(res, 1);
  // },
  // getReviews: async (req, res) => {
  //   try {
  //     const { userId } = req.params;

  //     const review = await Reviews.findAll({
  //       where: {
  //         userId
  //       }
  //     });

  //     if (review.length > 0) {
  //       await Promise.all(review.map(async c => {
  //         const user = await UserDetails.findOne({
  //           attributes: ['firstName', 'lastName', 'image'],
  //           where: {
  //             userId: c.reviewBy
  //           }
  //         });

  //         c.dataValues.userDetails = user;
  //       }));
  //     }

  //     return responseHelper.get(res, review);
  //   } catch (e) {
  //     return responseHelper.onError(res, e, 'Error while getting user reviews');
  //   }
  // },
  // getFriends: async (req, res) => {
  //   try {
  //     const { userId } = req.params;
  //     const { page, offset } = req.query;
  //     let pageNo;
  //     let offserLimit;

  //     if (page !== undefined && page !== 'undefined') {
  //       pageNo = page === 0 ? 0 : (page * offset);
  //     } else {
  //       pageNo = 0;
  //     }

  //     if (offset !== undefined && offset !== 'undefined') {
  //       offserLimit = parseInt(offset)
  //     } else {
  //       offserLimit = 999999999;
  //     }

  //     const friends = await Friends.findAndCountAll({
  //       where: {
  //         userFirstId: userId
  //       },
  //       offset: pageNo,
  //       limit: offserLimit
  //     });

  //     if (friends.rows.length > 0) {
  //       await Promise.all(friends.rows.map(async c => {
  //         const user = await UserDetails.findOne({
  //           attributes: ['firstName', 'lastName', 'image'],
  //           where: {
  //             userId: c.userSecondId
  //           }
  //         });

  //         c.dataValues.userDetails = user;
  //       }));
  //     }

  //     return responseHelper.get(res, friends);
  //   } catch (e) {
  //     return responseHelper.onError(res, e, 'Error while getting user reviews');
  //   }
  // },

  // apiRemoveImage: async (req, res) => {
  //   const data = req.body;
  //   try {
  //     common.checkSecurityKey(req);
  //     req.checkBody('userId').notEmpty().withMessage('user id is required');
  //     const error = req.validationErrors();
  //     if (error) {
  //       responseHelper.onError(res, '', error[0].msg);
  //       return;
  //     }
  //     const userDetails = await UserDetails.update(
  //       {
  //         image: ''
  //       },
  //       {
  //         where: {
  //           userId: data.userId,
  //         }
  //       });

  //     return responseHelper.put(res, 'image removed successfully');
  //   } catch (e) {
  //     return responseHelper.onError(res, e, 'Error while removing image');
  //   }

  // },
  // apiEditProfile: async (req, res) => {
  //   const data = req.body;
  //   try {
  //     common.checkSecurityKey(req);
  //     req.checkBody('id', 'id is required').notEmpty();
  //     req.checkBody('firstName', 'firstname is required').notEmpty();
  //     req.checkBody('lastName', ' lastname is required').notEmpty();
  //     req.checkBody('roleId', 'role id is required').notEmpty();
  //     req.checkBody('city', 'city is required').notEmpty();
  //     req.checkBody('state', 'state is required').notEmpty();
  //     req.checkBody('zip', 'zip is required').notEmpty();
  //     req.checkBody('country', 'country is required').notEmpty();
  //     req.checkBody('bioVideoLink', 'bio video link is required').notEmpty();
  //     req.checkBody('tagLine', 'tagLine is required').notEmpty();

  //     const error = req.validationErrors();
  //     if (error) {
  //       responseHelper.onError(res, '', error[0].msg);
  //       return;
  //     }
  //     const user = await Users.findOne({
  //       where: {
  //         id: data.id
  //       }
  //     });
  //     if (user) {
  //       const users = await Users.update(
  //         {
  //           roleId: data.roleId
  //         },
  //         {
  //           where: {
  //             id: data.id,
  //           }
  //         });
  //       if (users) {
  //         const usersDetails = await UserDetails.update(data, {
  //           where: {
  //             userId: data.id
  //           }
  //         });
  //         return responseHelper.put(res, data);
  //       }
  //     } else {
  //       responseHelper.onError(res, '', 'User not found');
  //     }
  //   } catch (e) {
  //     return responseHelper.onError(res, e, 'Error while updating user info');
  //   }
  // },
  // apiReportUser: async (req, res) => {
  //   const data = req.body;
  //   try {
  //     common.checkSecurityKey(req);
  //     req.checkBody('userId', 'userId is required').notEmpty();
  //     req.checkBody('reportBy', 'reportBy is required').notEmpty();
  //     req.checkBody('userId', 'userId should be integer').isInt();
  //     req.checkBody('reportBy', 'reportBy should be integer').isInt();
  //     req.checkBody('reason', 'reason is required').notEmpty();

  //     const error = req.validationErrors();
  //     if (error) {
  //       responseHelper.onError(res, '', error[0].msg);
  //       return;
  //     }

  //     const checkAlreadyReported = await ReportUser.findOne({
  //       where: {
  //         userId: data.userId,
  //         reportBy: data.reportBy
  //       }
  //     });

  //     if (checkAlreadyReported) {
  //       return responseHelper.onError(res, '', 'User Already Blocked By You');
  //     }

  //     const report = await ReportUser.create(data);
  //     return responseHelper.post(res, report);
  //   } catch (e) {
  //     return responseHelper.onError(res, e, 'Error while reporting user');
  //   }
  // },
}