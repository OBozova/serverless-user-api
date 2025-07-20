const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dynamo = new AWS.DynamoDB.DocumentClient();
const table = process.env.DYNAMODB_TABLE;

exports.handler = async (event) => {
  const { email, password, firstname, lastname } = JSON.parse(event.body);
  const hashedPassword = await bcrypt.hash(password, 10);
  const id = uuidv4();

  const params = {
    TableName: table,
    Item: { id, email, password: hashedPassword, firstname, lastname },
  };

  await dynamo.put(params).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({ id, email, firstname, lastname }),
  };
};
