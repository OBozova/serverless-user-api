import { handler } from '../../handlers/register';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import * as bcrypt from 'bcryptjs';
import * as uuid from 'uuid';
import { createMockEvent } from '../test-helpers';

// Mocks
jest.mock('bcryptjs');
jest.mock('uuid');

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('register.handler', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    ddbMock.reset();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  const validInput = {
    email: 'test@example.com',
    password: 'Password123!',
    firstname: 'Onur',
    lastname: 'Bozova'
  };

  it('returns 400 if body is missing', async () => {
    const result = await handler({ ...createMockEvent(), body: null });

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ error: 'Request body is required' });
  });

  it('returns 400 if email or password is missing', async () => {
    const result = await handler(
      createMockEvent({ body: JSON.stringify({ firstname: 'X', lastname: 'Y' }) })
    );

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ error: 'Email and password are required' });
  });

  it('returns 409 if user already exists', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{ email: 'test@example.com' }]
    });

    const event = createMockEvent({ body: JSON.stringify(validInput) });

    const result = await handler(event);

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(result.body)).toEqual({ error: 'User already exists' });
  });

  it('returns 201 if registration is successful', async () => {
    const fakeUserId = 'mock-uuid-1234';

    ddbMock.on(QueryCommand).resolves({ Items: [] });
    ddbMock.on(PutCommand).resolves({});
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (uuid.v4 as jest.Mock).mockReturnValue(fakeUserId);

    const event = createMockEvent({ body: JSON.stringify(validInput) });

    const result = await handler(event);

    expect(result.statusCode).toBe(201);

    const body = JSON.parse(result.body);
    expect(body).toEqual({
      id: fakeUserId,
      email: validInput.email,
      firstname: validInput.firstname,
      lastname: validInput.lastname
    });
  });

  it('returns 500 if DynamoDB fails', async () => {
    ddbMock.on(QueryCommand).rejects(new Error('DB Down'));

    const event = createMockEvent({ body: JSON.stringify(validInput) });

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ error: 'Internal server error' });
  });
});
