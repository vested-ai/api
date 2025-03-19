import { createAccount, sendVerificationEmail } from '../../services/account';
import { isValidEmail } from '../../utils/validation';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { generateVerificationCode, sendEmail } from '../../services/email';

// Setup proper TypeScript Jest mocks
jest.mock('../../utils/validation');
jest.mock('../../services/email');

// Create mock functions
const mockedIsValidEmail = jest.fn();
const mockedGenerateVerificationCode = jest.fn();
const mockedSendEmail = jest.fn();

// Assign mock implementations
(isValidEmail as jest.Mock) = mockedIsValidEmail;
(generateVerificationCode as jest.Mock) = mockedGenerateVerificationCode;
(sendEmail as jest.Mock) = mockedSendEmail;

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
      ddbMock.on(PutItemCommand).resolves({});

      const result = await createAccount('test@example.com', 'hashedPassword123');

      expect(result).toHaveProperty('registrationToken');
      expect(result).toHaveProperty('id');

      // Verify DynamoDB was called with correct parameters
      const putItemCommandCalls = ddbMock.commandCalls(PutItemCommand);
      expect(putItemCommandCalls).toHaveLength(1);

      const putParams = putItemCommandCalls[0].args[0].input;
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
      expect(ddbMock.commandCalls(PutItemCommand)).toHaveLength(0);
    });

    it.each([
      ['too short password', '123'],
      ['empty password', ''],
    ])('should return error for %s', async (_, password) => {
      mockedIsValidEmail.mockReturnValue(true);
      const result = await createAccount('test@example.com', password);
      expect(result).toEqual({ error: 'Password must be at least 4 characters long' });
      expect(ddbMock.commandCalls(PutItemCommand)).toHaveLength(0);
    });

    it('should return error when email already exists', async () => {
      mockedIsValidEmail.mockReturnValue(true);

      // Mock ConditionalCheckFailedException
      ddbMock.on(PutItemCommand).rejects(
        new ConditionalCheckFailedException({
          message: 'The conditional request failed',
          $metadata: {},
        }),
      );

      const result = await createAccount('existing@example.com', 'hashedPassword123');

      expect(result).toEqual({ error: 'Email already registered' });
    });

    it('should handle unexpected DynamoDB errors', async () => {
      mockedIsValidEmail.mockReturnValue(true);
      jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

      // Mock generic error
      ddbMock.on(PutItemCommand).rejects(new Error('Unknown error'));

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
