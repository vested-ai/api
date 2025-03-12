import { Request } from 'express';
import { APIGatewayProxyEvent } from 'aws-lambda';

export interface APIGatewayRequest<P = Record<string, never>, ResBody = Record<string, never>, ReqBody = any> extends Request<P, ResBody, ReqBody> {
  apiGateway?: {
    event: APIGatewayProxyEvent;
    context: any;
  };
} 