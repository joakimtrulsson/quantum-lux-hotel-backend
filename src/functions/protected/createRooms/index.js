const { db } = require('../../../services/index');

const { sendResponse, sendError } = require('../../../responses/index');
const readJsonFromS3 = require('../../../utils/readJsonFromS3Bucket');
const chunkArray = require('../../../utils/chunkArray');

exports.handler = async (event, context) => {
  try {
    const roomsData = await readJsonFromS3('myroomsbucket', 'roomsData.json');
    const availableDates = await readJsonFromS3('myroomsbucket', 'availableDates.json');

    const roomsRequest = roomsData.map((room) => ({
      PutRequest: {
        Item: room,
      },
    }));

    const datesRequests = availableDates.map((date) => ({
      PutRequest: {
        Item: date,
      },
    }));

    const chunkedRoomsRequests = chunkArray(roomsRequest, 25);
    const chunkedDatesRequests = chunkArray(datesRequests, 25);

    for (const chunk of chunkedRoomsRequests) {
      const result = await db
        .batchWrite({
          RequestItems: {
            ['roomsDb']: chunk,
          },
          ReturnConsumedCapacity: 'TOTAL',
        })
        .promise();

      if (result.UnprocessedItems.roomDb) {
        return sendError(500, { success: false, message: 'All rooms could not be created.' });
      }
    }

    for (const chunk of chunkedDatesRequests) {
      const result = await db
        .batchWrite({
          RequestItems: {
            ['availableDatesDb']: chunk,
          },
          ReturnConsumedCapacity: 'TOTAL',
        })
        .promise();
    }

    return sendResponse(200, { success: true, message: 'All rooms and dates have been created.' });
  } catch (error) {
    return sendError(500, { success: false, error: error });
  }
};
