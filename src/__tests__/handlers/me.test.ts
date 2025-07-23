import { handler } from '../../handlers/me';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { createMockEvent } from '../test-helpers';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('get-user-profile.handler', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    ddbMock.reset();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  const overrides = (userId?: string) => ({
    httpMethod: 'GET',
    path: '/me',
    requestContext: {
      accountId: '',
      apiId: '',
      httpMethod: 'GET',
      identity: {} as any,
      authorizer: {
        userId: userId ?? '',
        email: 'john@example.com',
        name: 'John Doe',
      },
      path: '',
      protocol: '',
      requestId: '',
      requestTimeEpoch: 0,
      resourceId: '',
      resourcePath: '',
      stage: '',
    } as any,
  });

  it('returns 401 if userId is missing', async () => {
    const event = createMockEvent(overrides(undefined));
    const result = await handler(event as any);
    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body)).toEqual({ error: 'Unauthorized' });
  });

  it('returns 404 if user not found', async () => {
    ddbMock.on(GetCommand).resolves({ Item: undefined });
    const event = createMockEvent(overrides('user-123'));
    const result = await handler(event as any);
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({ error: 'User not found' });
  });

  it('returns 200 with user profile if user exists', async () => {
    ddbMock.on(GetCommand).resolves({
      Item: {
        id: 'user-123',
        email: 'john@example.com',
        firstname: 'John',
        lastname: 'Doe',
        password: 'should-be-hidden',
      },
    });

    const event = createMockEvent(overrides('user-123'));
    const result = await handler(event as any);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      id: 'user-123',
      email: 'john@example.com',
      firstname: 'John',
      lastname: 'Doe',
    });
  });

  it('returns 500 on unexpected error', async () => {
    ddbMock.on(GetCommand).rejects(new Error('Boom!'));
    const event = createMockEvent(overrides('user-123'));
    const result = await handler(event as any);
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ error: 'Internal server error' });
  });
});
