const config = require('config');
const multer  = require('multer');
const path = require('path');
const common = require('./common');

const uploadFile = async (req,res,fields,filePath) => {
  try {
    imagesName= [];
    return new Promise(function (resolve, reject) {
    const storage =    multer.diskStorage({
      destination: function (req, file, callback) {
        callback(null, filePath);
      },
      filename:  function (req, file, callback) {
        callback(null, file.fieldname + '-' + common.timestamp()+ path.extname(file.originalname));
      }
    });
  const upload =  multer({ storage : storage}).fields(fields);
  upload(req,res,function(err) {
    if(err) {
      reject(err);
    }
    for(let i=0;i<req.files.image.length;i++) {
    imagesName.push({'imageName' : filePath + req.files.image[i].filename})
    }
    resolve(imagesName);
  });
})
  } catch (e) {
    console.log(e);
  }
}



module.exports = {
  uploadFile
}