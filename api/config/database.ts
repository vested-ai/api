import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export function createDynamoDBClient() {
  const dbConfig: {
    endpoint?: string;
    region: string;
    credentials?: { accessKeyId: string; secretAccessKey: string };
  } = {
    region: process.env.AWS_REGION || 'us-east-1',
  };

  // Use local endpoint for development
  if (process.env.NODE_ENV === 'development') {
    dbConfig.endpoint = process.env.DYNAMO_ENDPOINT;
    dbConfig.credentials = {
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy',
    };
  }

  const client = new DynamoDBClient(dbConfig);

  // Create document client for easier handling of data types
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true, // Remove undefined values from objects
    },
  });
}

// Export table names as constants
export const TableNames = {
  USERS: 'Users',
} as const;
