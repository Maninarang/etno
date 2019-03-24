const boom = require('boom');

const get = (res, message, resData) => {
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

const put = (res, message, resData) => {
  return res.status(200).json({
    message: message,
    body: resData
  });
}

const getError = (message) => {
  return {
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
  return res.status(400).json(getError(message));
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