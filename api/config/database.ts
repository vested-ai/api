import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isLocalEnvironment = process.env.IS_LOCAL_ENVIRONMENT === 'true';

type DbConfig = {
  endpoint?: string;
  region: string;
  credentials?: { accessKeyId: string; secretAccessKey: string };
  tls?: boolean;
  retryMode?: string;
};

export function createDynamoDBClient() {
  const dbConfig: DbConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
  };

  if (isLocalEnvironment) {
    dbConfig.endpoint = process.env.DYNAMO_ENDPOINT || 'http://localhost:8000';
    dbConfig.credentials = {
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy',
    };
    dbConfig.tls = false;
    dbConfig.retryMode = 'standard';
  }

  const client = new DynamoDBClient(dbConfig);

  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
}

export const TableNames = {
  USERS: `Users-${process.env.STAGE || 'development'}`,
} as const;
