import { PutCommand } from '@aws-sdk/lib-dynamodb/dist-types/commands/PutCommand';
import { createDynamoDBClient, TableNames } from '../config/database';
import { isValidEmail } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';

interface Account {
  email: string;
  password: string;
  isEmailVerified: boolean;
  registrationToken: string;
  createdAt: string;
  updatedAt: string;
}

interface AccountResponse {
  registrationToken?: string;
  id?: string;
  error?: string;
}

const dynamoDB = createDynamoDBClient();

export async function createAccount(
  email: string,
  hashedPassword: string,
): Promise<AccountResponse | { error: string }> {
  try {
    // Validate email
    if (!isValidEmail(email)) {
      return { error: 'Invalid email format' };
    }

    // Validate password
    if (!hashedPassword || hashedPassword.length < 4) {
      return { error: 'Password must be at least 4 characters long' };
    }

    const payload: any = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      isEmailVerified: false,
      registrationToken: uuidv4(),
    };

    try {
      await dynamoDB.send(
        new PutCommand({
          TableName: TableNames.USERS,
          Item: {
            ...payload,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          // Ensure email doesn't already exist
          ConditionExpression: 'attribute_not_exists(email) AND attribute_not_exists(id)',
        }),
      );

      return {
        id: payload.id,
        registrationToken: payload.registrationToken,
      };
    } catch (error) {
      if (error instanceof ConditionalCheckFailedError) {
        return { error: 'Email already registered' };
      }
      console.error('Error creating account:', error);
      return { error: 'Failed to create account' };
    }
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
