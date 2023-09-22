const { sendResponse, sendError } = require('../../../responses/index');
const { db } = require('../../../services/index');
const middy = require('@middy/core');
const { validateToken } = require('../../../middleware/validateToken');

const handler = middy(async (event, context) => {
  try {
    const email = event.email;
    console.log('te');

    const result = await db
      .query({
        TableName: process.env.DYNAMODB_BOOKINGS_TABLE,
        IndexName: 'bookingUserIndex',
        KeyConditionExpression: '#user = :user',
        ExpressionAttributeNames: {
          '#user': 'user',
        },
        ExpressionAttributeValues: {
          ':user': email,
        },
      })
      .promise();

    const { Items: bookings } = result;

    return sendResponse(200, { success: true, results: bookings.length, bookings: bookings });
  } catch (error) {
    console.error(error);
    return sendError(500, { success: false, message: 'Could not get all your bookings.' });
  }
}).use(validateToken);

module.exports = { handler };
