<!--
title: 'Serverless Framework Node Express API on AWS'
description: 'This template demonstrates how to develop and deploy a simple Node Express API running on AWS Lambda using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Node Express API on AWS

This template demonstrates how to develop and deploy a simple Node Express API service running on AWS Lambda using the Serverless Framework.

This template configures a single function, `api`, which is responsible for handling all incoming requests using the `httpApi` event. To learn more about `httpApi` event configuration options, please refer to [httpApi event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api/). As the event is configured in a way to accept all incoming requests, the Express.js framework is responsible for routing and handling requests internally. This implementation uses the `serverless-http` package to transform the incoming event request payloads to payloads compatible with Express.js. To learn more about `serverless-http`, please refer to the [serverless-http README](https://github.com/dougmoscrop/serverless-http).

## Usage

### Deployment

Install dependencies with:

```
npm install
```

and then deploy with:

```
serverless deploy
```

After running deploy, you should see output similar to:

```
Deploying "aws-node-express-api" to stage "dev" (us-east-1)

✔ Service deployed to stack aws-node-express-api-dev (96s)

endpoint: ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
functions:
  api: aws-node-express-api-dev-api (2.3 kB)
```

_Note_: In current form, after deployment, your API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer. For details on how to do that, refer to [`httpApi` event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api/).

### Invocation

After successful deployment, you can call the created application via HTTP:

```
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/
```

Which should result in the following response:

```json
{ "message": "Hello from root!" }
```

### Local development

#### DynamoDB Local Setup

Before starting the API, you'll need to set up DynamoDB locally:

1. Prerequisites:
   - Docker and Docker Compose
   - AWS CLI (optional, but useful for local testing)

2. Environment Setup:
   Create a `.env` file in the root directory:
   ```
   AWS_REGION=local
   AWS_ACCESS_KEY_ID=dummy
   AWS_SECRET_ACCESS_KEY=dummy
   DYNAMO_ENDPOINT=http://localhost:8000
   NODE_ENV=development
   ```

3. Start DynamoDB Local:
   ```
   npm run dynamodb:start
   ```

4. Initialize the database tables:
   ```
   npm run db:setup
   ```

5. To stop DynamoDB Local when done:
   ```
   npm run dynamodb:stop
   ```

#### Verifying DynamoDB Setup

If you have AWS CLI installed, you can verify the setup:
```bash
# List tables
aws dynamodb list-tables --endpoint-url http://localhost:8000

# View all items in the Users table
aws dynamodb scan --table-name Users --endpoint-url http://localhost:8000
```

#### AWS CLI Setup (Mac)

1. Install AWS CLI:
   ```bash
   brew install awscli
   ```

2. Verify installation:
   ```bash
   aws --version
   ```

3. Configure AWS CLI for local development:
   ```bash
   aws configure
   ```
   When prompted, enter the following:
   ```
   AWS Access Key ID: dummy
   AWS Secret Access Key: dummy
   Default region name: local
   Default output format: json
   ```

4. Verify configuration:
   ```bash
   aws configure list
   ```

5. Test AWS CLI with DynamoDB Local:
   ```bash
   # Make sure DynamoDB Local is running first
   npm run dynamodb:start

   # Test connection
   aws dynamodb list-tables \
     --endpoint-url http://localhost:8000
   ```

#### AWS CLI Common Commands for Local Development

```bash
# List all tables
aws dynamodb list-tables \
  --endpoint-url http://localhost:8000

# Describe a specific table
aws dynamodb describe-table \
  --table-name Users \
  --endpoint-url http://localhost:8000

# Scan (list all items) in a table
aws dynamodb scan \
  --table-name Users \
  --endpoint-url http://localhost:8000

# Get a specific item by email
aws dynamodb get-item \
  --table-name Users \
  --key '{"email": {"S": "user@example.com"}}' \
  --endpoint-url http://localhost:8000

# Delete a specific item
aws dynamodb delete-item \
  --table-name Users \
  --key '{"email": {"S": "user@example.com"}}' \
  --endpoint-url http://localhost:8000
```

#### AWS CLI Troubleshooting

1. If `aws configure` settings aren't being recognized:
   - Check your credentials file:
     ```bash
     cat ~/.aws/credentials
     ```
   - Check your config file:
     ```bash
     cat ~/.aws/config
     ```

2. If commands fail with "Unable to locate credentials":
   - Verify your .env file is properly set up
   - Ensure you've run `aws configure`
   - Try explicitly setting the AWS profile:
     ```bash
     export AWS_PROFILE=default
     ```

3. If DynamoDB commands fail:
   - Ensure you're including `--endpoint-url http://localhost:8000`
   - Verify DynamoDB Local is running (`docker ps`)
   - Check DynamoDB Local logs:
     ```bash
     docker logs dynamodb-local
     ```

#### Running the API

The easiest way to develop and test your function is to use the `dev` command:

```