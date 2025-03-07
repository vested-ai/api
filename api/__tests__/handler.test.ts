import { handler } from '../handler';
import { createAccount, sendVerificationEmail } from '../services/account';
import bcrypt from 'bcryptjs';

// Define interface for API response
interface ApiResponse {
statusCode: number;
body: string;
}

// Mock external dependencies
jest.mock('../services/account', () => ({
  createAccount: jest.fn(),
  sendVerificationEmail: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn()
}));

describe('API Handler', () => {
  let mockEvent: any;
  let context: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful responses
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (createAccount as jest.Mock).mockResolvedValue({ verificationCode: 'code123', id: 'user123' });
    (sendVerificationEmail as jest.Mock).mockResolvedValue('success');
  });

  describe('GET /', () => {
    beforeEach(() => {
      mockEvent = {
        httpMethod: 'GET',
        path: '/',
      };
    });

    it('should return welcome message', async () => {
    const response = await handler(mockEvent, context) as ApiResponse;
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        message: 'Hello from root!'
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
          password: 'password123'
        })
      };
    });

    it('should register a new user successfully', async () => {
    const response = await handler(mockEvent, context) as ApiResponse;
      
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(createAccount).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(sendVerificationEmail).toHaveBeenCalledWith('test@example.com', 'code123');
      
      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual({
        message: 'User registration successful'
      });
    });

    it.each([
      ['missing email', { password: 'password123' }],
      ['missing password', { email: 'test@example.com' }],
      ['empty body', {}]
    ])('should return 400 for %s', async (_, body) => {
      mockEvent.body = JSON.stringify(body);
    const response = await handler(mockEvent, context) as ApiResponse;
      
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Email and password are required'
      });
    });

    it('should handle account creation errors', async () => {
      (createAccount as jest.Mock).mockResolvedValue({ error: 'Invalid email format' });
      
    const response = await handler(mockEvent, context) as ApiResponse;
      
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Invalid email format'
      });
    });

    it('should handle verification email errors', async () => {
      (createAccount as jest.Mock).mockResolvedValue({ verificationCode: 'code123', id: 'user123' });
      (sendVerificationEmail as jest.Mock).mockResolvedValue({ error: 'Email service unavailable' });
      
    const response = await handler(mockEvent, context) as ApiResponse;
      
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Email service unavailable'
      });
    });

    it('should handle unexpected errors', async () => {
      (createAccount as jest.Mock).mockRejectedValue(new Error('Unexpected error'));
      
    const response = await handler(mockEvent, context) as ApiResponse;
      
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Internal server error'
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
    const response = await handler(mockEvent, context) as ApiResponse;
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Not Found'
      });
    });
  });
}); 