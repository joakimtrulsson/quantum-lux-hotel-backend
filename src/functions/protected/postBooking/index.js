const middy = require('@middy/core');
const { nanoid } = require('nanoid');

const { db } = require('../../../services/index');
const { validateToken } = require('../../../middleware/validateToken');
const { sendResponse, sendError } = require('../../../responses/index');
const {
  findAvailableRooms,
  areArraysEqual,
  calculateTotalMaxGuests,
  validateGuestCountForRooms,
  getDateArray,
  calculateTotalPrice,
  findDatesId,
} = require('../../../utils/bookingUtils');

const handler = middy(async (event) => {
  try {
    const { roomId, checkIn, checkOut, totalGuests } = JSON.parse(event.body);

    const availableRoomsIds = await findAvailableRooms(checkIn, checkOut);
    console.log(roomId, availableRoomsIds);
    const isRoomsStilAvailable = areArraysEqual(availableRoomsIds, roomId);

    if (!isRoomsStilAvailable)
      return sendResponse(409, {
        success: false,
        message:
          'The rooms you are trying to book have become unavailable. Please choose different dates or rooms.',
      });

    const params = {
      RequestItems: {
        roomsDb: {
          Keys: roomId.map((roomId) => ({ roomId })),
        },
      },
    };

    const roomDetails = await db.batchGet(params).promise();

    const maxGuestsPerBooking = calculateTotalMaxGuests(roomDetails);

    if (!validateGuestCountForRooms(maxGuestsPerBooking, totalGuests)) {
      return sendResponse(400, {
        success: false,
        message: 'The number of guests exceeds the maximum allowed per room.',
      });
    }

    const { length: totalDays } = getDateArray(checkIn, checkOut);
    const totalNights = totalDays - 1;
    const totalPrice = calculateTotalPrice(roomDetails, totalNights);

    const bookingId = nanoid(8);

    const newBooking = {
      bookingId: bookingId,
      dates: getDateArray(checkIn, checkOut),
      totalNights,
      totalGuests,
      totalPrice,
      bookedRooms: roomId,
      user: event.email,
      paid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const bookingParams = {
      TableName: 'bookingsDb',
      Item: newBooking,
    };

    const result = await db.put(bookingParams).promise();

    const datesIds = await findDatesId(checkIn, checkOut, roomId);

    const sortKeys = roomId;
    const primaryKeys = getDateArray(checkIn, checkOut);

    const deleteRequests = primaryKeys.flatMap((date) =>
      sortKeys.map((roomId) => ({
        DeleteRequest: {
          Key: {
            availableDate: date,
            roomId: roomId,
          },
        },
      }))
    );

    const deleteParams = {
      RequestItems: {
        [process.env.DYNAMODB_DATES_TABLE]: deleteRequests,
      },
    };

    const deleteResult = await db.batchWrite(deleteParams).promise();

    return sendResponse(200, {
      success: true,
      message: `Raderade ${datesIds.length} poster.`,
      deleteResult,
      bookingsDetails: newBooking,
    });
  } catch (error) {
    return sendError(400, {
      success: false,
      error: error.message,
      message: 'Could not complete your booking.',
    });
  }
}).use(validateToken);

module.exports = { handler };
