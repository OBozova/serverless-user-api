import { APIGatewayRequestAuthorizerEvent, CustomAuthorizerResult   } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET!;

interface DecodedToken {
  sub?: string;
  id?: string;
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

export const handler = async (event: APIGatewayRequestAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const token = event.headers?.Authorization?.split(' ')[1]; // Bearer <token>

    if (!token) throw new Error('No token provided');

    const decoded = jwt.verify(token, secret) as DecodedToken;

    const userId = decoded.sub || decoded.id || 'unknown-user';

    return {
      principalId: userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn
          }
        ]
      },
      context: {
        userId,
        email: decoded.email || '',
        name: decoded.name || ''
      }
    };
  } catch (err) {
    console.error('JWT verification failed:', err);

    // Return a Deny policy
    return {
      principalId: 'unauthorized',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: event.methodArn
          }
        ]
      }
    };
  }
};