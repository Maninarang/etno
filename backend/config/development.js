const db = require('./db');

module.exports = {
  db: db.development,
  userFilePath: 'images/users/',
  categoriesFilePath: 'images/categories/',
  jwtToken: 'etnocomputer',
  saltRounds: 10,
  baseUrl: ''
};