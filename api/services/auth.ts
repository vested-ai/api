import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { fetchUser } from './user';
import { config } from '../config/env';
import { createDynamoDBClient } from '../config/database';

interface AuthSuccess {
  token: string;
}

interface AuthError {
  error: 'invalid_credentials' | 'not_verified';
}

const dynamoDB = createDynamoDBClient();

export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthSuccess | AuthError> {
  const user = await fetchUser(email, dynamoDB);

  console.log('user', user);
  if (!user) {
    return { error: 'invalid_credentials' };
  }

  let isPasswordValid = false;

  try {
    isPasswordValid = await bcrypt.compare(password, user.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return { error: 'invalid_credentials' };
  }

  if (!isPasswordValid) {
    return { error: 'invalid_credentials' };
  }

  if (!user.isEmailVerified) {
    return { error: 'not_verified' };
  }

  const signOptions: SignOptions = {
    expiresIn: config.jwt.expiresIn as any,
  };

  // Create JWT token
  const token = jwt.sign(
    {
      email: user.email,
    },
    config.jwt.secret,
    signOptions,
  );

  return { token };
}
