import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fetchUser } from './user';

interface AuthSuccess {
  token: string;
}

interface AuthError {
  error: 'invalid_credentials' | 'not_verified';
}

export async function authenticateUser(email: string, password: string): Promise<AuthSuccess | AuthError> {
  const user = await fetchUser(email);

  if (!user) {
    return { error: 'invalid_credentials' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    return { error: 'invalid_credentials' };
  }

  if (!user.is_email_verified) {
    return { error: 'not_verified' };
  }

  // TODO: Move this to environment variable
  const JWT_SECRET = 'your-secret-key';
  
  // Create JWT token
  const token = jwt.sign(
    { 
      email: user.email,
      // Add any other claims you want to include
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { token };
} 