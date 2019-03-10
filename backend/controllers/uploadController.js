const config = require('config');

const uploadImage = require('../helpers/processFiles').uploadImage;
const decodeBase64Image = require('../helpers/processFiles').decodeBase64Image;
// Create a root reference
const routeMapping = {
  users: config.userFilePath,
  groups: config.groupFilePath,
  posts: config.postFilePath,
  poststhumbnail : config.postThumbFilePath
  //properties: config.propertyFilePath
};

const uploadImages = async (req, res) => {
  try {
    const { file, name, folderName } = req.body;
    const path = await uploadImage(name, file, routeMapping[folderName]);
  } catch (e) {
    console.log(e);
  }
}
const uploadFile = async (image, name, folderName) => {
  try {
    const path = await uploadImage(name, image, routeMapping[folderName]);
  } catch (e) {
    console.log(e);
  }
}


module.exports = {
  uploadImages,
  uploadFile
}