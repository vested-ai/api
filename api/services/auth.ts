import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { fetchUser } from './user';
import { config } from '../config/env';

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

  const signOptions: SignOptions = {
    expiresIn: config.jwt.expiresIn as any,
  }


  // Create JWT token
  const token = jwt.sign(
    { 
      email: user.email,
    },
    config.jwt.secret,
    signOptions
  );

  return { token };
} 