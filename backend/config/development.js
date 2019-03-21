const db = require('./db');

module.exports = {
  db: db.development,
  userFilePath: 'public/images/users/',
  categoriesFilePath: 'public/images/categories/',
  jwtToken: 'etnocomputer',
  saltRounds: 10,
  baseUrl: ''
};