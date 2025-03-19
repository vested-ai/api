import { GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDBClient, TableNames } from '../config/database';
import { VERIFICATION_REQUIRED_FIELDS_ERROR, VERIFICATION_FAILED_ERROR } from '../utils/constants';

const dynamoDB = createDynamoDBClient();

interface VerificationResponse {
  success?: boolean;
  error?: string;
}

export async function verifyEmail(
  email: string,
  token: string,
  code: string,
): Promise<VerificationResponse> {
  // Validate inputs
  if (!email || !token || !code) {
    return { error: VERIFICATION_REQUIRED_FIELDS_ERROR };
  }

  // Look up user by email
  let user;
  try {
    const response = await dynamoDB.send(
      new GetItemCommand({
        TableName: TableNames.USERS,
        Key: {
          email: { S: email },
        },
      }),
    );
    user = response.Item;
  } catch (error) {
    console.error('Failed to verify email:', error);
    return { error: VERIFICATION_FAILED_ERROR };
  }

  // User validation checks (outside try-catch)
  if (!user) {
    return { error: 'User not found' };
  }

  // Verify registration token
  if (!user.registrationToken?.S || user.registrationToken.S !== token) {
    return { error: 'Invalid registration token' };
  }

  // Verify code
  if (!user.verificationCode?.S || user.verificationCode.S !== code) {
    return { error: 'Invalid verification code' };
  }

  // Check if verification code has expired
  if (!user.verificationCodeExpiry?.S) {
    return { error: 'Verification code expiry not found' };
  }

  if (new Date(user.verificationCodeExpiry.S) < new Date()) {
    return { error: 'Verification code has expired' };
  }

  // Update user record to mark email as verified and clear verification data
  try {
    await dynamoDB.send(
      new UpdateItemCommand({
        TableName: TableNames.USERS,
        Key: {
          email: { S: email },
        },
        UpdateExpression:
          'SET isEmailVerified = :verified REMOVE verificationCode, verificationCodeExpiry, registrationToken',
        ExpressionAttributeValues: {
          ':verified': { BOOL: true },
        },
      }),
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to verify email:', error);
    return { error: VERIFICATION_FAILED_ERROR };
  }
}
