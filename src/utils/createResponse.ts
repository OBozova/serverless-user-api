import { APIGatewayProxyResult } from "aws-lambda";

const S3_BUCKET = process.env.S3_BUCKET || '';
const allowedOrigins = [
  'http://localhost:5173',
  ...(S3_BUCKET ? [`https://${S3_BUCKET}.s3.eu-central-1.amazonaws.com`] : [])
];

export const createResponse = (
  statusCode: number,
  body: any,
  origin?: string
): APIGatewayProxyResult => {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
};