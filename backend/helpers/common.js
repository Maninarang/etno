const config = require('config');
const requiredMessage = 'security key is required';
const notMatchMessage = 'security key not matched';

const checkSecurityKey = (req) => {
    req
    .checkHeaders(config.securityKeyFieldName)
    .notEmpty()
    .withMessage(requiredMessage)
    .equals(config.securityKey)
    .withMessage(notMatchMessage);
}

const mergeFields = (required,non_required,res)=>{
    const merge_object = Object.assign(required, non_required);
    return  merge_object;
}

const generateRandomString = (length = 10) => {
    return Math.random().toString(36).substr(0,length);
}

const generateOpt = () => {
   return  Math.floor(1000 + Math.random() * 9000);
}

const timestamp = () => {
	return time = Math.floor(Date.now()/1000)
}

module.exports = {
    checkSecurityKey,
    mergeFields,
    generateRandomString,
    generateOpt,
    timestamp
}