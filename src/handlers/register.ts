import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRegistration, UserProfile, ErrorResponse } from '../types';
import { createResponse } from '../utils/createResponse';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const table = process.env.DYNAMODB_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return createResponse(400, { error: 'Request body is required' } as ErrorResponse, event.headers?.origin);
    }

    const { email, password, firstname, lastname }: UserRegistration = JSON.parse(event.body);
    
    if (!email || !password) {
      return createResponse(400, { error: 'Email and password are required' } as ErrorResponse, event.headers?.origin);
    }

    const queryParams = new QueryCommand({
      TableName: table,
      IndexName: 'EmailIndex',
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email
      }
    });

    const result = await dynamo.send(queryParams);
    
    if (result.Items && result.Items.length > 0) {
      return createResponse(409, { error: 'User already exists' } as ErrorResponse, event.headers?.origin);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const user: User = {
      id,
      email,
      password: hashedPassword,
      firstname,
      lastname
    };

    const params = new PutCommand({
      TableName: table,
      Item: user,
    });

    await dynamo.send(params);

    const userProfile: UserProfile = { id, email, firstname, lastname };

    return createResponse(201, userProfile, event.headers?.origin);
  } catch (error) {
    console.error('Registration error:', error);
    return createResponse(500, { error: 'Internal server error' } as ErrorResponse, event.headers?.origin);
  }
};