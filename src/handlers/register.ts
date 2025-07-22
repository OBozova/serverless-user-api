import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRegistration, UserProfile, ErrorResponse, ApiResponse } from '../types';

const dynamo = new AWS.DynamoDB.DocumentClient();
const table = process.env.DYNAMODB_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Request body is required' } as ErrorResponse),
      };
    }

    const { email, password, firstname, lastname }: UserRegistration = JSON.parse(event.body);
    
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password are required' } as ErrorResponse),
      };
    }

    const queryParams: AWS.DynamoDB.DocumentClient.QueryInput = {
      TableName: table,
      IndexName: 'EmailIndex',
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email
      }
    };

    const result = await dynamo.query(queryParams).promise();
    
    if (result.Items && result.Items.length > 0) {
      return { 
        statusCode: 409, 
        body: JSON.stringify({ error: 'User already exists' } as ErrorResponse) 
      };
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

    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName: table,
      Item: user,
    };

    await dynamo.put(params).promise();

    const userProfile: UserProfile = { id, email, firstname, lastname };

    return {
      statusCode: 201,
      body: JSON.stringify(userProfile),
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' } as ErrorResponse),
    };
  }
};