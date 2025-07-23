import { handler } from '../../handlers/login';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { createMockEvent } from '../test-helpers';

// Mocks
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('login.handler', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    ddbMock.reset();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  const overrides = (body: any) => ({
    body: body ? JSON.stringify(body) : null,
    httpMethod: 'POST',
    path: '/login',
  })

  it('returns 400 if body is missing', async () => {
    const event = createMockEvent(overrides(null));
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ error: 'Request body is required' });
  });

  it('returns 400 if email or password is missing', async () => {
    const event = createMockEvent(overrides({ email: 'test@example.com' }));
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ error: 'Email and password are required' });
  });

  it('returns 404 if user not found', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });
    const event = createMockEvent(overrides({ email: 'test@example.com', password: 'pass' }));

    const result = await handler(event);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({ error: 'User Not Found' });
  });

  it('returns 401 if password is incorrect', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{ id: '123', email: 'test@example.com', password: 'hashed-pass' }]
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const event = createMockEvent(overrides({ email: 'test@example.com', password: 'wrong' }));
    const result = await handler(event);

    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body)).toEqual({ error: 'Unauthorized' });
  });

  it('returns 200 and JWT token if login is successful', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{ id: '123', email: 'test@example.com', password: 'hashed-pass' }]
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('mocked-jwt');

    const event = createMockEvent(overrides({ email: 'test@example.com', password: 'correct' }));
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ token: 'mocked-jwt' });
  });

  it('returns 500 if unexpected error happens', async () => {
    ddbMock.on(QueryCommand).rejects(new Error('Something went wrong'));

    const event = createMockEvent(overrides({ email: 'test@example.com', password: 'correct' }));
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ error: 'Internal server error' });
  });
});
