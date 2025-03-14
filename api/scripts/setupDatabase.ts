import { CreateTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { TableNames } from '../config/database';

async function setupDatabase() {
  const dbConfig: any = {
    region: process.env.AWS_REGION || 'local',
  };

  if (process.env.NODE_ENV === 'development') {
    dbConfig.endpoint = process.env.DYNAMO_ENDPOINT;
    dbConfig.credentials = {
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy'
    };
  }

  const client = new DynamoDBClient(dbConfig);

  try {
    console.log('Creating Users table...');
    await client.send(
      new CreateTableCommand({
        TableName: TableNames.USERS,
        AttributeDefinitions: [
          { AttributeName: 'email', AttributeType: 'S' },
        ],
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' },
        ],
        BillingMode: 'PAY_PER_REQUEST', // On-demand capacity
      })
    );
    console.log('Users table created successfully');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('Users table already exists');
    } else {
      console.error('Error creating table:', error);
      throw error;
    }
  }
}

if (require.main === module) {
  setupDatabase();
}

export { setupDatabase }; 