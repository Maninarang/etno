const config = require('config');
const db = require('../db/db');
const fs = require('fs');
const common = require('../helpers/common');
const responseHelper = require('../helpers/responseHelper');
const filesUpload = require('../helpers/uploadFiles').uploadFile;
const Users = db.models.users;
const Categories = db.models.categories;
Categories.belongsTo(Users, { foreignKey: 'addedBy' });

module.exports = {
  //////============================= add Category Function ===============================//////
  add: async (req, res) => {
    try {
      const uploadFile = await filesUpload(req, res, [{ name: 'image' }], config.categoriesFilePath);
      if (uploadFile) {
        const category = await Categories.findOne({
          where: {
            name: req.body.name
          }
        });
        if (!category) {
          const data = {};
          data.name = req.body.name;
          data.image = uploadFile[0].imageName;
          data.addedBy = common.userId(req.token);
          const addCategory = await Categories.create(data);
          if (addCategory) {
            responseHelper.post(res, 'Added', 'Category Added Successfully');
          } else {
            responseHelper.onError(res, 'Error', 'Something Went Wrong.Please Try Again');
          }
        } else {
          fs.unlinkSync(uploadFile[0].imageName);
          responseHelper.post(res, 'Exists', 'Category already exists');
        }
      }
      else {
        responseHelper.onError(res, 'Error', 'Something Went Wrong.Please Try Again');
      }

    } catch (e) {
      return responseHelper.onError(res, 'Error', e);
    }
  },
  //////============================= view Categories Function ===============================//////
  view: async (req, res) => {
    try {
      const category = await Categories.findAll({
        attributes: ['id', 'status', 'name', 'image', 'updatedAt', 'user.email'],
        include: [
          {
            model: Users,
            attributes: [],
            required: true
          },
        ],
        raw: true
      });
      if (category) {
        responseHelper.get(res, 'category list', category)
      } else {
        responseHelper.get(res, 'category list', [])
      }
    } catch (e) {
      return responseHelper.onError(res, 'Error', 'Something Went Wrong.Please Try Again');
    }
  },
  //////============================= get specific Category Function ===============================//////
  viewById: async (req, res) => {
    try {
      const catId = req.params.id;
      const category = await Categories.findByPk(catId,
        {
          attributes: ['id', 'status', 'name', 'image', 'user.email'],
          include: [
            {
              model: Users,
              attributes: [],
              required: true
            },
          ],
          raw: true
        });
      if (category) {
        responseHelper.get(res, 'category Detail', category)
      } else {
        responseHelper.onError(res, 'category Detail', 'Invalid Category Id')
      }
    } catch (e) {
      responseHelper.onError(res, 'Error', 'Something Went Wrong.Please Try Again');
    }
  },
  //////============================= update Category Status Function ===============================//////
  changeStatus: async (req, res) => {
    try {
      req.checkBody('id', 'category id is required').notEmpty();
      req.checkBody('status', 'status is required').notEmpty();
      req.checkBody('id', 'category id should be integer').isInt();
      const error = req.validationErrors();
      if (error) {
        responseHelper.onError(res, 'Error', error[0].msg);
        return;
      }
      const data = req.body;
      data.status = data.status;

      const catStatus = await Categories.update(
        data,
        {
          where: {
            id: data.id
          }
        });
      if (catStatus) {
        responseHelper.put(res, 'Status', 'Successfully Updated!')
      } else {
        responseHelper.onError(res, 'Error', 'Something Went Wrong.Please Try Again!')
      }
    } catch (e) {
      responseHelper.onError(res, 'Error', 'Something Went Wrong.Please Try Again!');
    }
  }
}