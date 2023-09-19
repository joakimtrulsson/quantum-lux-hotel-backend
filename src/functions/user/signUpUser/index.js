const { sendResponse, sendError } = require('../../../responses/index');
const { db } = require('../../../services/index');
const User = require('../../../models/userModel');
const { createToken } = require('../../../utils/signToken');

const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');

exports.handler = async (event, context) => {
  try {
    const requestBody = JSON.parse(event.body);

    if (requestBody.password !== requestBody.passwordConfirm) {
      return sendError(400, { success: false, message: 'Passwords do not match.' });
    }

    const userId = nanoid(6);

    const newUser = {
      ...User,
      ...requestBody,
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const userAlreadyExists = {
      TableName: process.env.DYNAMODB_USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': newUser.email,
      },
    };

    const emailExistsResult = await db.query(userAlreadyExists).promise();

    if (emailExistsResult.Items.length > 0) {
      return sendError(400, { success: false, message: 'Email already exists.' });
    }

    newUser.password = await bcrypt.hash(newUser.password, 12);

    const params = {
      TableName: 'usersDb',
      Item: newUser,
    };

    await db.put(params).promise();
    newUser.passwordConfirm = undefined;
    newUser.password = undefined;

    const token = createToken(newUser.Item);

    return sendResponse(200, {
      success: true,
      message: 'User registration successful.',
      user: newUser,
      token,
    });
  } catch (error) {
    console.error(error);
    return sendError(500, { success: false, error: 'User registration failed.' });
  }
};
