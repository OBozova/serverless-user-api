import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { StatsResponse, ErrorResponse } from '../types';
import { createResponse } from '../utils/createResponse';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const table = process.env.DYNAMODB_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const scanParams = new ScanCommand({
      TableName: table 
    });

    const scan = await dynamo.send(scanParams);
    
    const statsResponse: StatsResponse = { 
      userCount: scan.Count || 0 
    };

    return createResponse(200, statsResponse);
  } catch (error) {
    console.error('Stats error:', error);
    return createResponse(500, { error: 'Internal server error' } as ErrorResponse);
  }
};