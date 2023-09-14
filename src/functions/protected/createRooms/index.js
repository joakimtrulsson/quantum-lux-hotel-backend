const { sendResponse, sendError } = require('../../../responses/index');
const { db } = require('../../../services/index');
const rooms = [
  {
    roomId: 'room-1',
    type: 'single',
    price: 500,
    maxGuests: 1,
  },

  {
    roomId: 'room-2',
    type: 'double',
    price: 1000,
    maxGuests: 2,
  },
  {
    roomId: 'room-3',
    type: 'suite',
    price: 1500,
    maxGuests: 3,
  },
];
exports.handler = async (event, context) => {
  try {
    const request = rooms.map((room) => {
      return {
        PutRequest: {
          Item: room,
        },
      };
    });

    const result = await db
      .batchWrite({
        RequestItems: {
          ['roomDb']: request,
        },
        ReturnConsumedCapacity: 'TOTAL',
      })
      .promise();

    if (result.UnprocessedItems.roomDb) {
      return sendError(500, { success: false, message: 'Try again ' });
    }
    // await db
    //   .put({
    //     TableName: "roomsDb",
    //     Item: {},
    //   })
    //   .promise();

    // console.log("före", rooms);

    // await db.put(rooms, (err, data) => {
    //   if (err) {
    //     console.error("Error inserting data:", err);
    //   } else {
    //     console.log("Data inserted successfully:", data);
    //   }
    // }).promise()

    // console.log("efter", roomsData);

    // await db
    //   .put({
    //     TableName: 'roomDb',
    //     Item: {
    //       roomId: roomId,
    //       roomType: roomType,
    //       maxGuests: maxGuests,
    //       price: price,
    //     },
    //   })
    //   .promise();
    return sendResponse(200, { success: true, rooms });
  } catch (error) {
    return sendError(500, { success: false, error: error });
  }
};
