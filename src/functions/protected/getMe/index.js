const { sendResponse, sendError } = require('../../../responses/index');
const { db } = require('../../../services/index');
const middy = require('@middy/core');
const { validateToken } = require('../../../middleware/validateToken');

async function getAccount(email) {
  try {
    const user = await db
      .get({
        TableName: 'usersDb',
        Key: {
          email: email,
        },
      })
      .promise();

    if (user?.Item) return user.Item;
    else return false;
  } catch (error) {
    console.log(error);
  }
}

const handler = middy(async (event) => {
  try {
    if (!event?.email || (event?.error && event?.error === '401'))
      return sendError(401, { success: false, message: 'Invalid token.' });

    const account = await getAccount(event.email);

    if (!account) return sendError(401, { success: false, message: 'No account found.' });

    account.passwordConfirm = undefined;
    account.password = undefined;

    return sendResponse(200, { success: true, account: account });
  } catch (error) {
    return sendError(400, { success: false, message: 'Could not get account.' });
  }
}).use(validateToken);

module.exports = { handler };
