const { sendResponse, sendError } = require('../../../responses/index');
const { db } = require('../../../services/index');
const User = require('../../../models/userModel');
const { createToken } = require('../../../utils/signToken');

const bcrypt = require('bcryptjs');

exports.handler = async (event, context) => {
  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return sendError(400, 'Please provide username and password.');
    }

    const params = {
      TableName: 'usersDb',
      Key: {
        email: email,
      },
    };

    const userData = await db.get(params).promise();

    if (!userData.Item) {
      return sendError(401, 'User not found.');
    }

    const isPasswordValid = await bcrypt.compare(password, userData.Item.password);

    if (!isPasswordValid) {
      return sendError(401, 'Invalid password.');
    }

    userData.Item.password = undefined;
    userData.Item.passwordConfirm = undefined;

    const token = createToken(userData);

    return sendResponse(200, {
      success: true,
      message: 'You have successfully signed in.',
      userData,
      token,
    });
  } catch (error) {
    console.error(error);
    return sendError(500, { success: false, error: 'User sign in failed.' });
  }
};
