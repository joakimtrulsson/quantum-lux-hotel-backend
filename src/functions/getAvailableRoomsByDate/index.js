const { sendResponse, sendError } = require('../../responses/index');
const { db } = require('../../services/index');
const { findAvailableRooms } = require('../../utils/bookingUtils');

exports.handler = async (event, context) => {
  try {
    const { checkIn, checkOut } = event.queryStringParameters;

    if (!checkIn || !checkOut) {
      return sendError(400, {
        success: false,
        message: 'Both checkIn and checkOut are required parameters.',
      });
    }

    const availableRoomsIds = await findAvailableRooms(checkIn, checkOut);

    if (availableRoomsIds.length === 0)
      return sendResponse(200, {
        success: true,
        message: 'No available rooms for the selected dates. Please choose different dates.',
      });

    const params = {
      RequestItems: {
        roomsDb: {
          Keys: availableRoomsIds.map((roomId) => ({ roomId })),
        },
      },
    };

    const roomDetails = await db.batchGet(params).promise();

    return sendResponse(200, {
      success: true,
      results: roomDetails.Responses.roomsDb.length,
      roomDetails: roomDetails.Responses,
    });
  } catch (error) {
    console.log(error);
    return sendError(500, { success: false, message: 'Could not fetch available rooms.' });
  }
};
