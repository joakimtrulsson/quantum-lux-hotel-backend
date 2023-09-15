const { sendResponse, sendError } = require('../../responses/index');
const { db } = require('../../services/index');
const moment = require('moment');

exports.handler = async (event, context) => {
  try {
    const { checkIn, checkOut } = event.queryStringParameters;
    // Datumet som skickas som en query parameter
    console.log(checkIn, checkOut);
    if (!checkIn || !checkOut) {
      return sendError(400, { success: false, message: 'Date parameter is required.' });
    }

    const formattedCheckIn = moment(checkIn, 'YYYY-MM-DD').format('YYYY-MM-DD'); // Använd 'YYYY' istället för 'YY'
    const formattedCheckOut = moment(checkOut, 'YYYY-MM-DD').format('YYYY-MM-DD'); // Använd 'YYYY' istället för 'YY'

    console.log(formattedCheckIn, formattedCheckOut);
    const params = {
      TableName: process.env.DYNAMODB_ROOMS_TABLE,
      IndexName: 'AvailableRoomsIndex', // Namnet på din GSI
      FilterExpression: 'availableDates BETWEEN :formattedCheckIn AND :formattedCheckOut',
      ExpressionAttributeValues: {
        ':formattedCheckIn': formattedCheckIn, // Använd den formaterade datumen här
        ':formattedCheckOut': formattedCheckOut, // Använd den formaterade datumen här
      },
    };

    const result = await db.scan(params).promise();
    // Om det inte finns några lediga rum för det angivna datumet
    if (result.Items.length === 0) {
      return sendResponse(200, { success: true, message: 'No available rooms for the specified date.' });
    }

    return sendResponse(200, { sucess: true, results: result.length, AvailableRooms: result });
  } catch (error) {
    console.log(error);
    return sendError(500, { success: false, message: 'Could not fetch available rooms.' });
  }
};
