const config = require('config');
const jwt = require('jsonwebtoken');

const userId = (token) => {
    const decoded = jwt.verify(token, config.jwtToken);
    return decoded.id;
}
const generateRandomString = (length = 10) => {
    return Math.random().toString(36).substr(0,length);
}

const timestamp = () => {
	return time = Math.floor(Date.now()/1000)
}

module.exports = {
    userId,
    generateRandomString,
    timestamp
}