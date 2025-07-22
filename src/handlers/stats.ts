import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { StatsResponse, ErrorResponse } from '../types';

const dynamo = new AWS.DynamoDB.DocumentClient();
const table = process.env.DYNAMODB_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const scanParams: AWS.DynamoDB.DocumentClient.ScanInput = { 
      TableName: table 
    };

    const scan = await dynamo.scan(scanParams).promise();
    
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