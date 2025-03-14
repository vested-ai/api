import { isValidEmail } from '../utils/validation';

interface AccountResponse {
  verificationCode?: string;
  id?: string;
  error?: string;
}

export async function createAccount(
  email: string,
  password: string,
): Promise<AccountResponse | { error: string }> {
  try {
    // Validate email
    if (!isValidEmail(email)) {
      return { error: 'Invalid email format' };
    }

    // Validate password
    if (!password || password.length < 4) {
      return { error: 'Password must be at least 4 characters long' };
    }

    return {
      verificationCode: 'not implemented',
      id: 'not implemented',
    };
  } catch (error) {
    console.error('Failed to create account:', error);
    return { error: 'Failed to create account' };
  }
}

export async function sendVerificationEmail(
  email: string,
  verificationCode: string,
): Promise<string | { error: string }> {
  try {
    // Validate inputs
    if (!isValidEmail(email)) {
      return { error: 'Invalid email format' };
    }

    if (!verificationCode) {
      return { error: 'Missing verification code' };
    }

    return 'not implemented';
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { error: 'Failed to send verification email' };
  }
}
