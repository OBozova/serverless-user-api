import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { User, UserProfile, ErrorResponse } from '../types';

const dynamo = new AWS.DynamoDB.DocumentClient();
const table = process.env.DYNAMODB_TABLE!;

interface AuthorizedEvent extends APIGatewayProxyEvent {
  requestContext: APIGatewayProxyEvent['requestContext'] & {
    authorizer: {
      userId: string;
      email?: string;
      name?: string;
    };
  };
}

export const handler = async (event: AuthorizedEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { userId: id } = event.requestContext.authorizer;

    if (!id) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' } as ErrorResponse),
      };
    }

    const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
      TableName: table,
      Key: { id },
    };

    const result = await dynamo.get(params).promise();
    const user = result.Item as User | undefined;

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' } as ErrorResponse),
      };
    }

    // Return user profile without password
    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname
    };

    return {
      statusCode: 200,
      body: JSON.stringify(userProfile),
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' } as ErrorResponse),
    };
  }
};