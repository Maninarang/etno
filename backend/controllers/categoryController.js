const config = require('config');
const db = require('../db/db');
const fs = require('fs');
const common = require('../helpers/common');
const responseHelper = require('../helpers/responseHelper');
const filesUpload = require('../helpers/uploadFiles').uploadFile;
const Categories = db.models.categories;

module.exports = {
//////============================= add Category Function ===============================//////
add: async (req, res) => {
    try {
            const uploadFile = await filesUpload(req,res,[{name: 'image'}],config.categoriesFilePath);
            if(uploadFile) {
                const category = await Categories.findOne({
                    where: {
                      name: req.body.name
                    }
                  });
                  if (!category) {
                const data= {};
                data.name = req.body.name;
                data.image = uploadFile[0].imageName;
                data.addedBy = common.userId(req.token);
                const addCategory = await Categories.create(data);
                if(addCategory) {
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
      return responseHelper.get(res, 'Error',e);
    }
  },

}