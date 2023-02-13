const jwt = require('jsonwebtoken');
const httpError = require('../models/http-error');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Authorization :  Bearer TOKEN

    if (!token) {
      throw new Error('auth failed');
    }
    const decodedToken = jwt.verify(token, 'secretkey');

    req.userData = { userId: decodedToken.id };

    next();
  } catch (err) {
    const error = new httpError('authentication failed', 403);

    return next(error);
  }
};
