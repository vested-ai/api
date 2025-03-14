import { PutCommand, GetCommand, ConditionalCheckFailedException } from '@aws-sdk/lib-dynamodb';
import { createDynamoDBClient, TableNames } from '../config/database';

export interface User {
  email: string;
  password: string;
  verified: boolean;
  verificationCode: string;
  createdAt: string;
}

const dynamoDB = createDynamoDBClient();

export async function createAccount(email: string, hashedPassword: string): Promise<{ verificationCode: string } | { error: string }> {
  const verificationCode = Math.random().toString(36).substring(2, 15);
  
  try {
    await dynamoDB.send(
      new PutCommand({
        TableName: TableNames.USERS,
        Item: {
          email,
          password: hashedPassword,
          verified: false,
          verificationCode,
          createdAt: new Date().toISOString(),
        },
        // Ensure email doesn't already exist
        ConditionExpression: 'attribute_not_exists(email)',
      })
    );

    return { verificationCode };
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return { error: 'Email already registered' };
    }
    console.error('Error creating account:', error);
    return { error: 'Failed to create account' };
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: TableNames.USERS,
        Key: { email },
      })
    );

    return (result.Item as User) || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
} 