import { APIGatewayProxyResult } from "aws-lambda";

export const createResponse = (
  statusCode: number,
  body: any
): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Credentials': true,
  },
  body: JSON.stringify(body),
});