const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();
const table = process.env.DYNAMODB_TABLE;

exports.handler = async (event) => {
  const {userId:id} = event.requestContext.authorizer;
  const params = {
    TableName: table,
    Key: { id },
  };
  const result = await dynamo.get(params).promise();
  const user = result.Item;
  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
};
