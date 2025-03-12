import { APIGatewayRequest } from '../types/api';

export function getRequestBody<T>(req: APIGatewayRequest): T {
  return req.apiGateway?.event?.body ? JSON.parse(req.apiGateway.event.body) : req.body;
} 