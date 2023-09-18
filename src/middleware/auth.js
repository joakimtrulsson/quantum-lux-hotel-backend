const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWTSECRET, { expiresIn: process.env.JWTEXPIRATION });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const validateToken = {
  before: async (request) => {
    try {
      const token = request.event.headers.authorization.replace('Bearer ', '');

      if (!token) throw new Error();

      const data = jwt.verify(token, 'a1b1c1');
      request.event.id = data.id;
      request.event.username = data.username;

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
