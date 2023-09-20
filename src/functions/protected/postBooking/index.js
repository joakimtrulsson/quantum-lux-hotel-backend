const { sendResponse, sendError } = require('../../../responses/index');
const { db } = require('../../../services/index');
const middy = require('@middy/core');
const { validateToken } = require('../../../middleware/validateToken');

const handler = middy(async (event) => {
  try {
    // const account = await getAccount(event.email);

    return sendResponse(200, { success: true, email: event.email });
  } catch (error) {
    return sendError(400, { success: false, message: 'Could not complete your booking.' });
  }
}).use(validateToken);

module.exports = { handler };
