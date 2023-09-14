const { sendResponse, sendError } = require('../../../responses/index');
const { db } = require('../../../services/index');

// const moment = require('moment');

exports.handler = async (event, context) => {
  // const { bookingId } = event.pathParameters;
  // const params = {
  //   TableName: process.env.DYNAMODB_BOOKING_TABLE,
  //   Key: {
  //     bookingId: bookingId,
  //   },
  // };
  // try {
  //   const booking = await db.get(params).promise();
  //   if (!booking.Item) {
  //     return sendError(404, { success: false, message: 'Booking not found' });
  //   }
  //   const date = moment();
  //   const currentDateStr = date.format('YYYY/MM/DD');
  //   const checkInDate = new Date(booking.Item.checkIn);
  //   const currentDate = new Date(currentDateStr);
  //   const dateDifference = checkInDate.getTime() - currentDate.getTime();
  //   const calculateDaysDifference = dateDifference / (1000 * 3600 * 24);
  //   if (calculateDaysDifference < 2) {
  //     return sendError(400, {
  //       success: false,
  //       message: 'Booking can only be deleted two days or more in advance',
  //     });
  //   }
  //   await db.delete(params).promise();
  //   return sendResponse(200, { success: true, message: 'Booking deleted' });
  // } catch (error) {
  //   console.log(error);
  //   return sendError(500, { success: false, message: 'Could not delete booking' });
  // }
};
