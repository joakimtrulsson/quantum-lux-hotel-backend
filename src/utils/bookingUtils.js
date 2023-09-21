const { db } = require('../services/index');

const getDateArray = (checkIn, checkOut) => {
  const dateArray = [];
  const currentDate = new Date(checkIn);

  while (currentDate <= new Date(checkOut)) {
    dateArray.push(currentDate.toISOString());
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArray;
};

const findAvailableRooms = async (checkIn, checkOut) => {
  const dateArray = getDateArray(checkIn, checkOut);

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
};

const findDatesId = async (checkIn, checkOut, roomIds) => {
  const generateExpressionValues = (roomIds) => {
    const expressionValues = {};
    roomIds.forEach((roomId, index) => {
      const key = `:roomId${index + 1}`;
      expressionValues[key] = roomId;
    });
    return expressionValues;
  };

  const expressionValues = generateExpressionValues(roomIds);

  const params = {
    TableName: 'availableDatesDb',
    FilterExpression: `availableDate BETWEEN :startDate AND :endDate AND roomId IN (${Object.keys(
      expressionValues
    ).join(', ')})`,
    ExpressionAttributeValues: {
      ':startDate': checkIn,
      ':endDate': checkOut,
      ...expressionValues,
    },
  };

  const result = await db.scan(params).promise();
  const matchingItems = result.Items;
  const matchingRoomIds = matchingItems.map((item) => item.id);

  console.log('matching roomIds', matchingRoomIds);
  return matchingRoomIds;
};

module.exports = {
  calculateTotalPrice: function (roomDetails, totalNights) {
    if (!roomDetails || !Array.isArray(roomDetails.Responses.roomsDb)) {
      return 0;
    }

    const totalPrice = roomDetails.Responses.roomsDb.reduce((acc, room) => {
      return acc + room.price * totalNights;
    }, 0);

    return totalPrice;
  },
  calculateTotalDays: function (checkIn, checkOut) {
    return new Date(checkOut).getDate() - new Date(checkIn).getDate();
  },
  calculateTotalMaxGuests: function (roomDetails) {
    const rooms = roomDetails.Responses.roomsDb;

    if (!rooms || rooms.length === 0) {
      return 0;
    }

    const totalGuests = rooms.reduce((total, room) => {
      return total + room.maxGuests;
    }, 0);

    return totalGuests;
  },
  validateGuestCountForRooms: function (maxGuestsPerBooking, totalGuests) {
    return maxGuestsPerBooking >= totalGuests;
  },
  areArraysEqual: function (arr1, arr2) {
    return arr2.every((element) => arr1.includes(element));
  },

  getDateArray: getDateArray,
  findAvailableRooms: findAvailableRooms,
  findDatesId: findDatesId,
};
