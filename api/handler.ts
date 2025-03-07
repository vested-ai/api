import 'reflect-metadata';
import { Handler } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { Context } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  await app.init();
  
  const expressApp = app.getHttpAdapter().getInstance();
  const handler = serverlessExpress({ app: expressApp });
  return handler;
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: any,
) => {
  if (!server) {
    server = await bootstrap();
  }
  return server(event, context, callback);
}; 