import { PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { createDynamoDBClient, TableNames } from '../config/database';
import { isValidEmail } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';
import { generateVerificationCode, sendEmail } from './email';

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
      if (error instanceof ConditionalCheckFailedException) {
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
  registrationToken: string,
): Promise<string | { error: string }> {
  try {
    // Validate inputs
    if (!isValidEmail(email)) {
      return { error: 'Invalid email format' };
    }

    if (!registrationToken) {
      return { error: 'Missing registration token' };
    }

    const verificationCode = generateVerificationCode();

    // Store the verification code in DynamoDB
    await dynamoDB.send(
      new UpdateCommand({
        TableName: TableNames.USERS,
        Key: { email },
        UpdateExpression: 'SET verificationCode = :code, verificationCodeExpiry = :expiry',
        ExpressionAttributeValues: {
          ':code': verificationCode,
          ':expiry': new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes expiry
        },
      }),
    );

    // Send the email
    await sendEmail({
      to: email,
      subject: 'Verify your email address',
      text: `Your verification code is: ${verificationCode}. This code will expire in 15 minutes.`,
      html: `
        <h1>Email Verification</h1>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>This code will expire in 15 minutes.</p>
      `,
    });

    return 'Verification email sent successfully';
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { error: 'Failed to send verification email' };
  }
}
