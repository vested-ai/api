import { GetCommand } from '@aws-sdk/lib-dynamodb/dist-types/commands/GetCommand';
import { TableNames } from '../config/database';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb/dist-types';
import bcrypt from 'bcryptjs';

interface User {
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
}

export async function fetchUser(
  email: string,
  client: DynamoDBDocumentClient,
): Promise<User | null> {
  try {
    const result = await client.send(
      new GetCommand({
        TableName: TableNames.USERS,
        Key: { email },
      }),
    );

    return (result.Item as User) || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
