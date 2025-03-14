import { isValidEmail } from '../../utils/validation';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it.each([
      ['standard email', 'test@example.com'],
      ['email with dots', 'user.name@domain.com'],
      ['email with plus', 'user+label@domain.co.uk'],
    ])('should validate %s as valid', (_, email) => {
      expect(isValidEmail(email)).toBe(true);
    });

    it.each([
      ['empty string', ''],
      ['missing @ symbol', 'invalid-email'],
      ['only domain', '@domain.com'],
      ['missing domain', 'user@'],
      ['incomplete domain', 'user@domain'],
      ['missing @', 'user.domain.com'],
      ['contains spaces', ' user@domain.com '],
      ['trailing dot', 'user@domain.com.'],
    ])('should reject %s as invalid', (_, email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });
});
