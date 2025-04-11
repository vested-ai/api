import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { createDynamoDBClient, TableNames } from '../config/database';
import { isValidEmail } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';
import { generateVerificationCode, sendEmail } from './email';
import { PutItemCommand, UpdateItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';

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

interface SerializationOptions {
  expressionKey?: boolean;
}

const dynamoDB = createDynamoDBClient();

function serializeDynamoDBItem(
  item: Record<string, any>,
  options?: SerializationOptions,
): Record<string, AttributeValue> {
  return Object.entries(item).reduce(
    (acc, [key, value]) => {
      if (value === undefined || value === null) {
        return acc;
      }

      if (typeof value === 'string') {
        acc[options?.expressionKey ? ':'.concat(key) : key] = { S: value };
      } else if (typeof value === 'number') {
        acc[options?.expressionKey ? ':'.concat(key) : key] = { N: value.toString() };
      } else if (typeof value === 'boolean') {
        acc[options?.expressionKey ? ':'.concat(key) : key] = { BOOL: value };
      }
      // Add more type conversions as needed

      return acc;
    },
    {} as Record<string, AttributeValue>,
  );
}

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

    const payload = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      isEmailVerified: false,
      registrationToken: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const serializedPayload = serializeDynamoDBItem(payload);

    try {
      await dynamoDB.send(
        new PutItemCommand({
          TableName: TableNames.USERS,
          Item: serializedPayload,
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
    try {
      const payload = {
        code: verificationCode,
        expiry: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        token: registrationToken,
      };

      await dynamoDB.send(
        new UpdateItemCommand({
          TableName: TableNames.USERS,
          Key: serializeDynamoDBItem({ email }),
          UpdateExpression: 'SET verificationCode = :code, verificationCodeExpiry = :expiry',
          ExpressionAttributeValues: serializeDynamoDBItem(payload, { expressionKey: true }),
          ConditionExpression: 'registrationToken = :token',
        }),
      );
    } catch (error) {
      console.error('Failed to update verification code in database:', error);
      return { error: 'Failed to send verification email' };
    }

    const registrationLink = `${process.env.FRONTEND_URL}/verify-email?token=${registrationToken}`;

    // Send the email
    const emailResult = await sendEmail({
      to: email,
      subject: 'Verify your email address',
      text: `Your verification code is: ${verificationCode}. This code will expire in 15 minutes.`,
      html: `
        <h1>Email Verification</h1>
        <p>Complete your registration by following the link below and entering the verification code:</p>
        <p>Link: <a href="${registrationLink}">${registrationLink}</a></p>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>This code will expire in 15 minutes.</p>
      `,
    });

    if (emailResult && 'code' in emailResult) {
      switch (emailResult.code) {
        case 'SANDBOX_RECIPIENT_NOT_VERIFIED':
          return { 
            error: 'This email address needs to be verified in our system first. Please contact support.' 
          };
        case 'DAILY_QUOTA_EXCEEDED':
          return { 
            error: 'Unable to send verification email due to system limits. Please try again later.' 
          };
        default:
          console.error('Email sending failed:', emailResult);
          return { 
            error: 'Failed to send verification email. Please try again later.' 
          };
      }
    }

    return 'Verification email sent successfully';
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { error: 'Failed to send verification email' };
  }
}
