const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const { sendResponse, sendError } = require('../responses/index');

const validateToken = {
  before: async (request) => {
    try {
      const token = request.event.headers.authorization.replace('Bearer ', '');

      if (!token) throw new Error('No token provided.');

      const decoded = await promisify(jwt.verify)(token, process.env.JWTSECRET);

      request.event.email = decoded.email;

      return request.response;
    } catch (error) {
      console.log(error.name);
      if (error.name === 'JsonWebTokenError') {
        return sendError(401, { success: false, message: 'Invalid token.' });
      }
      if (error.name === 'TokenExpiredError') {
        return sendError(401, { success: false, message: 'Token has expired.' });
      }
      // request.event.error = '401';
      // return request.response;
    }
  },
  onError: async (request) => {
    request.event.error = '401';
    return request.response;
  },
};

module.exports = { validateToken };
