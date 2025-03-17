import { handler } from '../handler';
import { createAccount, sendVerificationEmail } from '../services/account';
import bcrypt from 'bcryptjs';
import {
  EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE,
  EMAIL_SERVICE_UNAVAILABLE_ERROR_MESSAGE,
} from '../utils/constants';

// Define interface for API response
interface ApiResponse {
  statusCode: number;
  body: string;
}

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  default: {
    hash: jest.fn().mockResolvedValue('hashedPassword'),
  },
}));

// Mock services with implementations
jest.mock('../services/account', () => ({
  createAccount: jest.fn(),
  sendVerificationEmail: jest.fn(),
}));

// Create mock functions
const mockedCreateAccount = jest.fn();
const mockedSendVerificationEmail = jest.fn();
const mockedBcryptHash = jest.fn().mockResolvedValue('hashedPassword');

// Assign mock implementations
(createAccount as jest.Mock) = mockedCreateAccount;
(sendVerificationEmail as jest.Mock) = mockedSendVerificationEmail;
(bcrypt.hash as jest.Mock) = mockedBcryptHash;

describe('API Handler', () => {
  let mockEvent: any;
  let context: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedCreateAccount.mockResolvedValue({ registrationToken: 'code123', id: 'user123' });
    mockedSendVerificationEmail.mockResolvedValue('success');
  });

  describe('GET /', () => {
    beforeEach(() => {
      mockEvent = {
        httpMethod: 'GET',
        path: '/',
      };
    });

    it('should return welcome message', async () => {
      const response = (await handler(mockEvent, context)) as ApiResponse;
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        message: 'Hello from root!',
      });
    });
  });

  describe('POST /register', () => {
    beforeEach(() => {
      mockEvent = {
        httpMethod: 'POST',
        path: '/register',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
        headers: [
          {
            'Content-Type': 'application/json',
          },
        ],
      };
    });

    it('should register a new user successfully', async () => {
      const response = (await handler(mockEvent, context)) as ApiResponse;

      expect(mockedBcryptHash).toHaveBeenCalledWith('password123', 12);
      expect(mockedCreateAccount).toHaveBeenCalledWith('test@example.com', 'hashedPassword');
      expect(mockedSendVerificationEmail).toHaveBeenCalledWith('test@example.com', 'code123');

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual({
        message: 'User registration successful',
      });
    });

    it.each([
      ['missing email', { password: 'password123' }],
      ['missing password', { email: 'test@example.com' }],
      ['empty body', {}],
    ])('should return 400 for %s', async (_, body) => {
      mockEvent.body = JSON.stringify(body);
      const response = (await handler(mockEvent, context)) as ApiResponse;

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Email and password are required',
      });
    });

    it('should handle account creation errors', async () => {
      (createAccount as jest.Mock).mockResolvedValue({
        error: EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE,
      });

      const response = (await handler(mockEvent, context)) as ApiResponse;

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({
        error: EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE,
      });
    });

    it('should handle verification email errors', async () => {
      (createAccount as jest.Mock).mockResolvedValue({
        registrationToken: 'code123',
        id: 'user123',
      });
      (sendVerificationEmail as jest.Mock).mockResolvedValue({
        error: 'Email service unavailable',
      });

      const response = (await handler(mockEvent, context)) as ApiResponse;

      expect(JSON.parse(response.body)).toEqual({
        error: EMAIL_SERVICE_UNAVAILABLE_ERROR_MESSAGE,
      });
      expect(response.statusCode).toBe(500);
    });

    it('should handle unexpected errors', async () => {
      (createAccount as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

      const response = (await handler(mockEvent, context)) as ApiResponse;

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Internal server error',
      });
    });

    it('should handle missing verification code from account creation', async () => {
      (createAccount as jest.Mock).mockResolvedValue({ id: 'user123' }); // no registrationToken

      const response = (await handler(mockEvent, context)) as ApiResponse;

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Verification code not found',
      });
    });
  });

  describe('404 handler', () => {
    beforeEach(() => {
      mockEvent = {
        httpMethod: 'GET',
        path: '/nonexistent',
      };
    });

    it('should return 404 for non-existent routes', async () => {
      const response = (await handler(mockEvent, context)) as ApiResponse;
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Not Found',
      });
    });
  });
});
