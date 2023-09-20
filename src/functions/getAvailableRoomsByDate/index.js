const { sendResponse, sendError } = require('../../responses/index');
const { db } = require('../../services/index');

function getDateArray(checkIn, checkOut) {
  const dateArray = [];
  const currentDate = new Date(checkIn);

  while (currentDate <= new Date(checkOut)) {
    dateArray.push(currentDate.toISOString());
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArray;
}

async function findAvailableRooms(checkIn, checkOut) {
  const dateArray = getDateArray(checkIn, checkOut);
  console.log('datearray', dateArray);

  const params = {
    TableName: 'availableDatesDb',
    FilterExpression: 'availableDate BETWEEN :startDate AND :endDate',
    ExpressionAttributeValues: {
      ':startDate': checkIn,
      ':endDate': checkOut,
    },
  };

  const result = await db.scan(params).promise();
  const allRooms = result.Items;

  const availableRooms = [];

  const uniqueRoomIds = new Set();

  for (const date of dateArray) {
    const filteredItems = allRooms.filter((item) => item.availableDate === date);

    filteredItems.forEach((item) => uniqueRoomIds.add(item.roomId));
  }

  const uniqueRoomIdsArray = Array.from(uniqueRoomIds);

  for (const roomId of uniqueRoomIdsArray) {
    if (
      dateArray.every((date) =>
        allRooms.some((item) => item.availableDate === date && item.roomId === roomId)
      )
    ) {
      availableRooms.push(roomId);
    }
  }

  return availableRooms;
}

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
