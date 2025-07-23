import { handler } from '../../handlers/stats';
import { createMockEvent } from '../test-helpers';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Mock AWS client
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('stats.handler', () => {
    beforeEach(() => {
        ddbMock.reset();
    });

    it('returns 200 with user count', async () => {
        ddbMock.on(ScanCommand).resolves({
            Count: 5,
            Items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }]
        });

        const event = createMockEvent();
        const result = await handler(event);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual({ userCount: 5 });
    });

    it('returns 200 with user count 0 if no items', async () => {
        ddbMock.on(ScanCommand).resolves({
            Count: 0,
            Items: []
        });

        const event = createMockEvent();
        const result = await handler(event);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual({ userCount: 0 });
    });

    it('returns 500 on DynamoDB error', async () => {
        ddbMock.on(ScanCommand).rejects(new Error('DynamoDB failure'));

        const event = createMockEvent();
        const result = await handler(event);

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({ error: 'Internal server error' });
    });
});