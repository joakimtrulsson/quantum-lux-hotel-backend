const { sendResponse, sendError } = require('../../../responses/index');
const { db } = require('../../../services/index');
const middy = require('@middy/core');
const { validateToken } = require('../../../middleware/validateToken');

const handler = middy(async (event, context) => {
  try {
    const {
      email,
      pathParameters: { bookingId },
    } = event;

    const params = {
      TableName: process.env.DYNAMODB_BOOKINGS_TABLE,
      Key: {
        bookingId: bookingId,
      },
    };

    const { Item: booking } = await db.get(params).promise();

    if (!booking) {
      return sendError(404, { success: false, message: 'Booking not found.' });
    }

    if (booking.user !== email) {
      return sendError(403, {
        success: false,
        message: 'Access denied. You do not have permission to view this booking.',
      });
    }

    return sendResponse(200, { success: true, booking });
  } catch (error) {
    console.error(error);
    return sendError(500, { success: false, message: 'Could not get all your bookings.' });
  }
}).use(validateToken);

module.exports = { handler };
