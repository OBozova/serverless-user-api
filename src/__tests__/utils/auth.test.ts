import { handler } from '../../utils/auth';
import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

describe('auth.handler', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  const baseEvent: APIGatewayRequestAuthorizerEvent = {
    type: 'REQUEST',
    methodArn: 'arn:aws:execute-api:us-east-1:123456789012:example/prod/GET/my-path',
    headers: {},
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
    httpMethod: 'GET',
    multiValueHeaders: {},
    path: '/my-path',
  };

  it('returns Allow policy if token is valid', async () => {
    const token = jwt.sign({ sub: 'user-123', email: 'test@example.com', name: 'Onur Bozova' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    const event = {
      ...baseEvent,
      headers: {
        Authorization: 'Bearer ' + token
      }
    };

    const result = await handler(event);

    expect(result.principalId).toBe('user-123');
    expect(result.policyDocument.Statement[0].Effect).toBe('Allow');
    expect(result.context).toEqual({
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Onur Bozova'
    });
  });

  it('returns Deny policy if token is missing', async () => {
    const result = await handler(baseEvent);

    expect(result.principalId).toBe('unauthorized');
    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
  });

  it('returns Deny policy if token is invalid', async () => {
    const event = {
      ...baseEvent,
      headers: {
        Authorization: 'Bearer invalid.token.here'
      }
    };

    const result = await handler(event);

    expect(result.principalId).toBe('unauthorized');
    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
  });

  it('returns fallback user id if sub is missing', async () => {
    const token = jwt.sign({ email: 'test@example.com', name: 'Onur Bozova' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    const event = {
      ...baseEvent,
      headers: {
        Authorization: 'Bearer ' + token
      }
    };

    const result = await handler(event);

    expect(result.principalId).toBe('unknown-user');
    expect(result.context?.userId).toBe('unknown-user');
  });
});
