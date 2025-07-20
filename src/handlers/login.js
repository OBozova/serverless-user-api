const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dynamo = new AWS.DynamoDB.DocumentClient();
const table = process.env.DYNAMODB_TABLE;
const secret = process.env.JWT_SECRET;

exports.handler = async (event) => {
  const { email, password } = JSON.parse(event.body);

  const params = {
    TableName: table,
    Key: { email },
  };

  const result = await dynamo.get(params).promise();
  const user = result.Item;

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const token = jwt.sign({ sub: user.id }, secret, { expiresIn: '1h' });

  return {
    statusCode: 200,
    body: JSON.stringify({ token }),
  };
};
