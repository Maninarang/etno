const boom = require('boom');

const get = (res , message,resData) => {
  return res.json({
    message: message,
    body: resData
  });
}

const post = (res, message, resData) => {
  return res.json({
    message: message,
    body: resData
  });
}

const del = (res, resData) => {
  return res.json({
    code: 200,
    message: '',
    body: resData
  });
}

const put = (res, message,resData) => {
  return res.json({
    code: 200,
    message: message,
    body: resData
  });
}

const getError = (message) => {
  return {
    success: false,
    code: 400,
    message: message,
    body: {}
   };
}

const unauthorized = (res, data) => {
  return res.status(401).json({
    message: 'User is Unauthorized',
    body: data
  });
}

const onError = (res, err, message) => {
  console.log(err);
  console.log(boom.badRequest(message));
  console.log(getError(message));
  return res.json(getError(message));
}

const noData = (res, err, message) => {
  return res.status(204).json({
    message: 'User is Unauthorized',
    body: {}
  });
  }

module.exports = {
  get,
  post,
  put,
  del,
  onError,
  noData,
  unauthorized
}