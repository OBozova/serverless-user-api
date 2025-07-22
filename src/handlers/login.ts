import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, UserLogin, LoginResponse, ErrorResponse } from '../types';

const dynamo = new AWS.DynamoDB.DocumentClient();
const table = process.env.DYNAMODB_TABLE!;
const secret = process.env.JWT_SECRET!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Request body is required' } as ErrorResponse),
      };
    }

    const { email, password }: UserLogin = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password are required' } as ErrorResponse),
      };
    }

    const params: AWS.DynamoDB.DocumentClient.QueryInput = {
      TableName: table,
      IndexName: 'EmailIndex',
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email
      }
    };

    const result = await dynamo.query(params).promise();
    
    if (result.Items && result.Items.length > 0) {
      const user = result.Items[0] as User;
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return { 
          statusCode: 401, 
          body: JSON.stringify({ error: 'Unauthorized' } as ErrorResponse) 
        };
      }
      
      const token = jwt.sign({ sub: user.id }, secret, { expiresIn: '1h' });

      return {
        statusCode: 200,
        body: JSON.stringify({ token } as LoginResponse),
      };
    } else {
      return { 
        statusCode: 404, 
        body: JSON.stringify({ error: 'User Not Found' } as ErrorResponse) 
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' } as ErrorResponse),
    };
  }
};