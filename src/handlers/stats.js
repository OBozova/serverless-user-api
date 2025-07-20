const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const table = process.env.DYNAMODB_TABLE;

exports.handler = async () => {
  const scan = await dynamo.scan({ TableName: table }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({ userCount: scan.Count }),
  };
};
