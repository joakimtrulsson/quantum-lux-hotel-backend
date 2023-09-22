const middy = require('@middy/core');
const { nanoid } = require('nanoid');

const { sendResponse, sendError } = require('../../../responses/index');
const { db } = require('../../../services/index');
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
        message: 'Access denied. You do not have permission to delete this booking.',
      });
    }

    const { dates: datesToSave, bookedRooms: roomsToSave } = booking;
    const newAvailableDates = datesToSave.flatMap((date) =>
      roomsToSave.map((roomId) => ({
        availableDate: date,
        roomId: roomId,
        id: nanoid(6),
      }))
    );

    const saveRequest = newAvailableDates.map((date) => {
      return {
        PutRequest: {
          Item: date,
        },
      };
    });

    const result = await db
      .batchWrite({
        RequestItems: {
          [process.env.DYNAMODB_DATES_TABLE]: saveRequest,
        },
        ReturnConsumedCapacity: 'TOTAL',
      })
      .promise();

    if (result.UnprocessedItems.roomDb) {
      return sendError(500, { success: false, message: 'All dates could not be saved.' });
    }

    const deleteParams = {
      TableName: process.env.DYNAMODB_BOOKINGS_TABLE,
      Key: {
        bookingId: bookingId,
      },
    };
    await db.delete(deleteParams).promise();

    return sendResponse(200, {
      success: true,
      newAvailableDates,
      message: 'Booking deleted successfully.',
    });
  } catch (error) {
    console.error(error);
    return sendError(500, { success: false, message: 'Could not delete the booking.' });
  }
}).use(validateToken);

module.exports = { handler };
