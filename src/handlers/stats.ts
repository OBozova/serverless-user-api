import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { StatsResponse, ErrorResponse } from '../types';

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

    return {
      statusCode: 200,
      body: JSON.stringify(statsResponse),
    };
  } catch (error) {
    console.error('Stats error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' } as ErrorResponse),
    };
  }
};