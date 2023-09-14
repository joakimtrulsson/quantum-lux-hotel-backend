const AWS = require('aws-sdk');

const s3 = new AWS.S3();

async function readJsonFromS3(bucket, key) {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    const data = await s3.getObject(params).promise();
    const jsonData = JSON.parse(data.Body.toString());
    console.log('i funktionen', jsonData);
    return jsonData;
  } catch (error) {
    console.log(error);
  }
}

module.exports = readJsonFromS3;
