import { APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
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

interface AuthorizerResponse {
  isAuthorized: boolean;
  context?: {
    userId: string;
    email: string;
    name: string;
  };
}

export const handler = async (event: APIGatewayRequestAuthorizerEvent): Promise<AuthorizerResponse> => {
  try {
    const token = event.headers?.authorization?.split(' ')[1] || 
                  event.headers?.Authorization?.split(' ')[1];

    if (!token) {
      return {
        isAuthorized: false
      };
    }

    const decoded = jwt.verify(token, secret) as DecodedToken;
    
    return {
      isAuthorized: true,
      context: {
        userId: decoded.sub || decoded.id || '',
        email: decoded.email || '',
        name: decoded.name || ''
      }
    };
  } catch (err) {
    console.error('JWT verification error:', err);
    return {
      isAuthorized: false
    };
  }
};