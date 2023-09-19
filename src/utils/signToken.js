const jwt = require('jsonwebtoken');

const createToken = (user) => {
  const token = jwt.sign({ email: user.email }, process.env.JWTSECRET, {
    expiresIn: process.env.JWTEXPIRATION,
  });

  // res.cookie('jwt', token, {
  //   expires: new Date(Date.now() + process.env.TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: 'none',
  // });

  return token;
};

module.exports = { createToken };
