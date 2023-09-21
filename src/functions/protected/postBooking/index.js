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

    // 1) Först vill vi kontrollera så roomId fortfarande ledigt enligt checkIn och checkOut

    const availableRoomsIds = await findAvailableRooms(checkIn, checkOut);
    console.log(roomId, availableRoomsIds);
    const isRoomsStilAvailable = areArraysEqual(availableRoomsIds, roomId);

    if (!isRoomsStilAvailable)
      return sendResponse(409, {
        success: false,
        message:
          'The rooms you are trying to book have become unavailable. Please choose different dates or rooms.',
      });

    // 2) Sen vill vi kontrollera att antalet gäster inte är fler än maxguests.
    // 2a) Först måste vi hämta price och addera maxGuests för varje rum.

    const params = {
      RequestItems: {
        roomsDb: {
          Keys: roomId.map((roomId) => ({ roomId })),
        },
      },
    };

    const roomDetails = await db.batchGet(params).promise();

    const maxGuestsPerBooking = calculateTotalMaxGuests(roomDetails);

    // 2b) Kontrollera att totalGuest <= maxGuests

    if (!validateGuestCountForRooms(maxGuestsPerBooking, totalGuests)) {
      return sendResponse(400, {
        success: false,
        message: 'The number of guests exceeds the maximum allowed per room.',
      });
    }

    // 3 a) Räkna ut hur många dagar
    const { length: totalDays } = getDateArray(checkIn, checkOut);
    const totalNights = totalDays - 1;

    // 3 b) Räkna ut totalkostanden

    const totalPrice = calculateTotalPrice(roomDetails, totalNights);

    // 4) Sen vill vi skapa objektet som skall sparas. NanoId för id på beställningen.

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
    console.log(newBooking);
    // 5) Sen kan vi spara objektet.

    const bookingParams = {
      TableName: 'bookingsDb',
      Item: newBooking,
    };

    const result = await db.put(bookingParams).promise();

    //  6) Nu kan vi plocka bort dates från availableDatesDb.
    //  6a) Hämta id för de datum och rum bokningen gäller. checkIn, checkOut, roomId
    const datesIds = await findDatesId(checkIn, checkOut, roomId);

    //  6b) Plocka bort de från databasen
    // roomId partitionkey,
    const sortKeys = roomId;
    const primaryKeys = getDateArray(checkIn, checkOut);
    console.log('sortkey', sortKeys);
    console.log('primary', primaryKeys);

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
