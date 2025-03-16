import { createAccount, sendVerificationEmail } from '../../services/account';
import { isValidEmail } from '../../utils/validation';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';

// Setup proper TypeScript Jest mocks
jest.mock('../../utils/validation', () => ({
isValidEmail: jest.fn()
}));

// TypeScript type for mocked functions
const mockedIsValidEmail = isValidEmail as jest.MockedFunction<typeof isValidEmail>;

// Create DynamoDB mock
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('Account Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    ddbMock.reset();
  });

  describe('createAccount', () => {
    it('should return registration token and id for valid inputs', async () => {
      // Mock validation
    mockedIsValidEmail.mockReturnValue(true);
      
      // Mock successful DynamoDB put
      ddbMock.on(PutCommand).resolves({});

      const result = await createAccount('test@example.com', 'hashedPassword123');
      
      expect(result).toHaveProperty('registrationToken');
      expect(result).toHaveProperty('id');
      
      // Verify DynamoDB was called with correct parameters
      const putCommandCalls = ddbMock.commandCalls(PutCommand);
      expect(putCommandCalls).toHaveLength(1);
      
      const putParams = putCommandCalls[0].args[0].input;
      expect(putParams.Item).toMatchObject({
        email: 'test@example.com',
        password: 'hashedPassword123',
        isEmailVerified: false,
      });
    });

    it('should return error for invalid email', async () => {
    mockedIsValidEmail.mockReturnValue(false);

      const result = await createAccount('invalid-email', 'hashedPassword123');
      
      expect(result).toEqual({ error: 'Invalid email format' });
      expect(ddbMock.commandCalls(PutCommand)).toHaveLength(0);
    });

    it.each([
      ['too short password', '123'],
      ['empty password', ''],
    ])('should return error for %s', async (_, password) => {
    mockedIsValidEmail.mockReturnValue(true);
      const result = await createAccount('test@example.com', password);
      expect(result).toEqual({ error: 'Password must be at least 4 characters long' });
      expect(ddbMock.commandCalls(PutCommand)).toHaveLength(0);
    });

    it('should return error when email already exists', async () => {
    mockedIsValidEmail.mockReturnValue(true);
      
      // Mock ConditionalCheckFailedException
      ddbMock.on(PutCommand).rejects(new ConditionalCheckFailedException({
        message: 'The conditional request failed',
        $metadata: {}
      }));

      const result = await createAccount('existing@example.com', 'hashedPassword123');
      
      expect(result).toEqual({ error: 'Email already registered' });
    });

    it('should handle unexpected DynamoDB errors', async () => {
    mockedIsValidEmail.mockReturnValue(true);
      
      // Mock generic error
      ddbMock.on(PutCommand).rejects(new Error('Unknown error'));

      const result = await createAccount('test@example.com', 'hashedPassword123');
      
      expect(result).toEqual({ error: 'Failed to create account' });
    });
  });

  describe('sendVerificationEmail', () => {
    it('should validate email using validation utility', async () => {
    mockedIsValidEmail.mockReturnValue(true);
      await sendVerificationEmail('test@example.com', 'code123');
      expect(isValidEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return error when email is invalid', async () => {
    mockedIsValidEmail.mockReturnValue(false);
      const result = await sendVerificationEmail('invalid-email', 'code123');
      expect(result).toEqual({ error: 'Invalid email format' });
    });

    it('should return error for missing verification code', async () => {
    mockedIsValidEmail.mockReturnValue(true);
      const result = await sendVerificationEmail('test@example.com', '');
    expect(result).toEqual({ error: 'Missing registration token' });
    });

    it('should return success message for valid inputs', async () => {
    mockedIsValidEmail.mockReturnValue(true);
      const result = await sendVerificationEmail('test@example.com', 'code123');
    expect(result).toBe('Verification email sent successfully');
    });
  });
});
