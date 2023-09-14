const { DocumentClient } = require('aws-sdk/clients/dynamodb');

const db = new DocumentClient({
  region: process.env.DYNAMODB_REGION,
});

module.exports = { db };
