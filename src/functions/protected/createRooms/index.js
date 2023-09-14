const { sendResponse, sendError } = require('../../../responses/index');
const { db } = require('../../../services/index');

const readJsonFromS3 = require('../../../utils/readJsonFromS3Bucket');

exports.handler = async (event, context) => {
  try {
    const roomsData = await readJsonFromS3('myroomsbucket', 'roomsData.json');

    const request = roomsData.map((room) => {
      return {
        PutRequest: {
          Item: room,
        },
      };
    });

    const result = await db
      .batchWrite({
        RequestItems: {
          ['roomsDb']: request,
        },
        ReturnConsumedCapacity: 'TOTAL',
      })
      .promise();
    console.log(result);

    if (result.UnprocessedItems.roomDb) {
      return sendError(500, { success: false, message: 'All rooms could not be created.' });
    }

    return sendResponse(200, { success: true, message: 'All rooms have been created.' });
  } catch (error) {
    return sendError(500, { success: false, error: error });
  }
};
