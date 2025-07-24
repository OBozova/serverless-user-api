import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { User, UserProfile, ErrorResponse } from '../types';
import { createResponse } from '../utils/createResponse';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
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
      return createResponse(401, { error: 'Unauthorized' } as ErrorResponse, event.headers?.origin);
    }

    const params = new GetCommand({
      TableName: table,
      Key: { id },
    });

    const result = await dynamo.send(params);
    const user = result.Item as User | undefined;

    if (!user) {
      return createResponse(404, { error: 'User not found' } as ErrorResponse, event.headers?.origin);
    }

    // Return user profile without password
    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname
    };

    return createResponse(200, userProfile, event.headers?.origin);
  } catch (error) {
    console.error('Get user profile error:', error);
    return createResponse(500, { error: 'Internal server error' } as ErrorResponse, event.headers?.origin);
  }
};