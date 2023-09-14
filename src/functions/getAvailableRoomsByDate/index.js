const { sendResponse, sendError } = require('../../responses/index');
const { db } = require('../../services/index');

exports.handler = async (event, context) => {
  try {
    const result = await db
      .scan({
        TableName: process.env.DYNAMODB_BOOKING_TABLE,
      })
      .promise();

    const { Items: bookings } = result;

    return sendResponse(200, { sucess: true, results: bookings.length, Bookings: bookings });
  } catch (error) {
    console.log(error);
    return sendError(500, { success: false, message: 'Kunde inte hämta bokningar.' });
  }
};
