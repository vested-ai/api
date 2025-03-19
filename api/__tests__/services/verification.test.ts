import { verifyEmail } from '../../services/verification';
import { createDynamoDBClient } from '../../config/database';
import {
  VERIFICATION_REQUIRED_FIELDS_ERROR,
  VERIFICATION_FAILED_ERROR,
} from '../../utils/constants';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

// Mock the DynamoDB client
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('verifyEmail', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Clear all mocks before each test
    jest.clearAllMocks();
    ddbMock.reset();
  });

  it('should return error when email is missing', async () => {
    const result = await verifyEmail('', 'token123', 'code123');
    expect(result).toEqual({
      error: VERIFICATION_REQUIRED_FIELDS_ERROR,
    });
  });

  it('should return error when token is missing', async () => {
    const result = await verifyEmail('test@example.com', '', 'code123');
    expect(result).toEqual({
      error: VERIFICATION_REQUIRED_FIELDS_ERROR,
    });
  });

  it('should return error when code is missing', async () => {
    const result = await verifyEmail('test@example.com', 'token123', '');
    expect(result).toEqual({
      error: VERIFICATION_REQUIRED_FIELDS_ERROR,
    });
  });

  it('should return error when user is not found', async () => {
    ddbMock.on(GetItemCommand).resolves({});

    const result = await verifyEmail('test@example.com', 'token123', 'code123');
    expect(result).toEqual({
      error: 'User not found',
    });
  });

  it('should return error when token does not match', async () => {
    ddbMock.on(GetItemCommand).resolves({
      Item: {
        email: { S: 'test@example.com' },
        registrationToken: { S: 'different-token' },
      },
    });

    const result = await verifyEmail('test@example.com', 'token123', 'code123');
    expect(result).toEqual({
      error: 'Invalid registration token',
    });
  });

  it('should return error when verification code does not match', async () => {
    ddbMock.on(GetItemCommand).resolves({
      Item: {
        registrationToken: { S: 'token123' },
        verificationCode: { S: 'different-code' },
      },
    });

    const result = await verifyEmail('test@example.com', 'token123', 'code123');
    expect(result).toEqual({
      error: 'Invalid verification code',
    });
  });

  it('should return error when verification code has expired', async () => {
    const expiredDate = new Date(Date.now() - 1000).toISOString(); // 1 second ago
    ddbMock.on(GetItemCommand).resolves({
      Item: {
        registrationToken: { S: 'token123' },
        verificationCode: { S: 'code123' },
        verificationCodeExpiry: { S: expiredDate },
      },
    });

    const result = await verifyEmail('test@example.com', 'token123', 'code123');
    expect(result).toEqual({
      error: 'Verification code has expired',
    });
  });

  it('should return error when verification code expiry is missing', async () => {
    ddbMock.on(GetItemCommand).resolves({
      Item: {
        registrationToken: { S: 'token123' },
        verificationCode: { S: 'code123' },
        // verificationCodeExpiry is missing
      },
    });

    const result = await verifyEmail('test@example.com', 'token123', 'code123');
    expect(result).toEqual({
      error: 'Verification code expiry not found',
    });
  });

  it('should return success for valid verification', async () => {
    const futureDate = new Date(Date.now() + 1000000).toISOString(); // Far in the future
    ddbMock
      .on(GetItemCommand)
      .resolves({
        Item: {
          registrationToken: { S: 'token123' },
          verificationCode: { S: 'code123' },
          verificationCodeExpiry: { S: futureDate },
        },
      })
      .on(UpdateItemCommand)
      .resolves({});

    const result = await verifyEmail('test@example.com', 'token123', 'code123');
    expect(result).toEqual({
      success: true,
    });

    // Verify the update command was called correctly
    expect(ddbMock.calls()).toHaveLength(2);
    const updateCall = ddbMock.call(1);
    expect(updateCall.args[0].input).toEqual({
      TableName: 'Users',
      Key: {
        email: { S: 'test@example.com' },
      },
      UpdateExpression:
        'SET isEmailVerified = :verified REMOVE verificationCode, verificationCodeExpiry, registrationToken',
      ExpressionAttributeValues: {
        ':verified': { BOOL: true },
      },
    });
  });

  it('should handle unexpected errors', async () => {
    ddbMock.on(GetItemCommand).rejects(new Error('Database error'));

    const result = await verifyEmail('test@example.com', 'token123', 'code123');
    expect(result).toEqual({
      error: VERIFICATION_FAILED_ERROR,
    });
  });
});
