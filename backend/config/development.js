const db = require('./db');

module.exports = {
  db: db.development,
  userFilePath: 'public/images/users/',
  jwtToken: 'etnocomputer',
  saltRounds: 10,
  baseUrl: ''
};