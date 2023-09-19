const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const validateToken = {
  before: async (request) => {
    try {
      const token = request.event.headers.authorization.replace('Bearer ', '');

      if (!token) throw new Error();

      const decoded = await promisify(jwt.verify)(token, process.env.JWTSECRET);
      request.event.email = decoded.email;

      return request.response;
    } catch (error) {
      request.event.error = '401';
      return request.response;
    }
  },
  onError: async (request) => {
    request.event.error = '401';
    return request.response;
  },
};

module.exports = { validateToken };
