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

# Vested API

Backend API for the Vested app.

## Local Development Setup

### Prerequisites
- Node.js (v20 or later)
  ```bash
  # macOS/Linux using nvm
  nvm install 20
  nvm use 20
  
  # Windows
  # Download and install from https://nodejs.org/
  ```
- Docker and Docker Compose
  ```bash
  # macOS
  brew install docker docker-compose
  
  # Linux
  sudo apt-get update
  sudo apt-get install docker.io docker-compose
  
  # Windows
  # Download and install Docker Desktop from https://www.docker.com/products/docker-desktop
  ```
- Yarn package manager
  ```bash
  npm install -g yarn
  ```
- AWS CLI
  ```bash
  brew install awscli

  # See "AWS CLI Setup (Mac)" below for more details
  ```

### Services
The application uses several services that run locally via Docker:

1. **DynamoDB Local**
   - Port: 8000
   - Web Interface: http://localhost:8000/shell
   - Used for local database development

2. **MailHog (Email Testing)**
   - SMTP Port: 1025
   - Web Interface: http://localhost:8025
   - Used for testing email functionality locally
   - All emails sent during development are captured here instead of being sent to real addresses

### Getting Started

1. Install dependencies:

```bash
yarn install
```

2. Environment Setup:

```bash
# Create a `.env` file in the api/ directory:
cp .env.example api/.env
```

3. Start database and SMTP server:

```bash
yarn run db:reset
```

3. Start the API server:

```bash
yarn run dev
```

The API will be available at http://localhost:3000

### Email Testing

During development, all emails are sent to MailHog instead of real email addresses. This allows you to:
- View all sent emails in a web interface
- Test email formatting and content
- Ensure email functionality without sending real emails

To view sent emails:
1. Ensure Docker services are running (`yarn db:start`)
2. Open http://localhost:8025 in your browser
3. Any emails sent by the application will appear here

### Available Scripts

- `yarn dev` - Start the development server
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn build` - Build the application
- `yarn type-check` - Check TypeScript types
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint issues
- `yarn db:start` - Start Docker services (DynamoDB Local and MailHog)
- `yarn db:stop` - Stop Docker services
- `yarn db:setup` - Set up database tables
- `yarn db:reset` - Reset Docker services and database tables

### Verifying DynamoDB Setup

If you have AWS CLI installed, you can verify the setup:
```bash
# List tables
aws dynamodb list-tables --endpoint-url http://localhost:8000

# View all items in the Users table
aws dynamodb scan --table-name Users --endpoint-url http://localhost:8000
```

### AWS CLI Setup (Mac)

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

### AWS CLI Common Commands for Local Development

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

### AWS CLI Troubleshooting

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