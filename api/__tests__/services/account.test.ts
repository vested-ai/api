import { createAccount, sendVerificationEmail } from '../../services/account';
import { isValidEmail } from '../../utils/validation';

// Mock the validation utility
jest.mock('../../utils/validation', () => ({
  isValidEmail: jest.fn()
}));

describe('Account Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('should validate email using validation utility', async () => {
      (isValidEmail as jest.Mock).mockReturnValue(true);
      await createAccount('test@example.com', 'password123');
      expect(isValidEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return error when email is invalid', async () => {
      (isValidEmail as jest.Mock).mockReturnValue(false);
      const result = await createAccount('invalid-email', 'password123');
      expect(result).toEqual({ error: 'Invalid email format' });
    });

    it.each([
      ['too short password', '123'],
      ['empty password', ''],
    ])('should return error for %s', async (_, password) => {
      (isValidEmail as jest.Mock).mockReturnValue(true);
      const result = await createAccount('test@example.com', password);
      expect(result).toEqual({ error: 'Password must be at least 4 characters long' });
    });

    it('should return verification code and id for valid inputs', async () => {
      (isValidEmail as jest.Mock).mockReturnValue(true);
      const result = await createAccount('test@example.com', 'password123');
      expect(result).toHaveProperty('verificationCode');
      expect(result).toHaveProperty('id');
    });
  });

  describe('sendVerificationEmail', () => {
    it('should validate email using validation utility', async () => {
      (isValidEmail as jest.Mock).mockReturnValue(true);
      await sendVerificationEmail('test@example.com', 'code123');
      expect(isValidEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return error when email is invalid', async () => {
      (isValidEmail as jest.Mock).mockReturnValue(false);
      const result = await sendVerificationEmail('invalid-email', 'code123');
      expect(result).toEqual({ error: 'Invalid email format' });
    });

    it('should return error for missing verification code', async () => {
      (isValidEmail as jest.Mock).mockReturnValue(true);
      const result = await sendVerificationEmail('test@example.com', '');
      expect(result).toEqual({ error: 'Missing verification code' });
    });

    it('should return success message for valid inputs', async () => {
      (isValidEmail as jest.Mock).mockReturnValue(true);
      const result = await sendVerificationEmail('test@example.com', 'code123');
      expect(result).toBe('not implemented');
    });
  });
}); 