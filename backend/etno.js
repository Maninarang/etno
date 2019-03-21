const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const bearerToken = require('express-bearer-token');
const server = require('http').createServer(app);
const expressValidator = require('express-validator');
const port = process.env.PORT || 3004;
const passport = require('passport');
const routes = require('./routes/routes');
const checkConn = require('./helpers/checkConn');


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Access-Control-Request-Headers");
  res.header("Access-Control-Allow-Headers", "Content-Type, authorization");
  next();
});
app.use(expressValidator());
app.use(bearerToken());


/*
Increase Upload File Size
*/
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true,limit: '50mb' }));

// Passport
app.use(passport.initialize());
require('./passport')(passport);

app.use('/api', routes);

//app.use('/images/users', express.static(path.join(__dirname, 'public/images/users/')));
//app.use('/contacts', express.static(path.join(__dirname, 'public/contacts/')));
app.use(express.static(path.join(__dirname, 'public')))





const healthCheck = async () => {
  await checkConn.checkDbConnection();
};

server.listen(port, async () => {
  await healthCheck();
  console.log(`Listening on port ${port}`);
});
