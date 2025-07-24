import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, UserLogin, LoginResponse, ErrorResponse } from '../types';
import { createResponse } from '../utils/createResponse';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const table = process.env.DYNAMODB_TABLE!;
const secret = process.env.JWT_SECRET!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return createResponse(400, { error: 'Request body is required' } as ErrorResponse, event.headers?.Origin);
    }

    const { email, password }: UserLogin = JSON.parse(event.body);

    if (!email || !password) {
      return createResponse(400, { error: 'Email and password are required' } as ErrorResponse, event.headers?.Origin);
    }

    const params = new QueryCommand({
      TableName: table,
      IndexName: 'EmailIndex',
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email
      }
    });

    const result = await dynamo.send(params);
    
    if (result.Items && result.Items.length > 0) {
      const user = result.Items[0] as User;
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return createResponse(401, { error: 'Unauthorized' } as ErrorResponse, event.headers?.Origin);
      }
      
      const token = jwt.sign({ sub: user.id, isAdmin: user.isAdmin }, secret, { expiresIn: '1h' });

      return createResponse(200,{ token } as LoginResponse, event.headers?.Origin);
    } else {
      return createResponse(404,{ error: 'User Not Found' } as ErrorResponse, event.headers?.Origin);
    }
  } catch (error) {
    console.error('Login error:', error);
    return createResponse(500, { error: 'Internal server error' } as ErrorResponse, event.headers?.Origin);
  }
};