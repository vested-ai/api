import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isLocalEnvironment =
  process.env.IS_LOCAL_ENVIRONMENT || process.env.NODE_ENV === 'development';

type DbConfig = {
  endpoint?: string;
  region: string;
  credentials?: { accessKeyId: string; secretAccessKey: string };
  tls?: boolean;
  retryMode?: string;
};

export function createDynamoDBClient() {
  // Use local endpoint for development
  const dbConfig: DbConfig = isLocalEnvironment
    ? {
        region: 'localhost',
        endpoint: process.env.DYNAMO_ENDPOINT || 'http://localhost:8000',
        credentials: {
          accessKeyId: 'dummy',
          secretAccessKey: 'dummy',
        },
        tls: false,
        retryMode: 'standard',
      }
    : {
        region: process.env.AWS_REGION || 'us-east-1',
      };

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
