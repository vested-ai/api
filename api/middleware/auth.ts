import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { APIGatewayRequest } from '../types/api';

interface JWTPayload {
  email: string;
  // Add other claims as needed
}

export interface AuthenticatedRequest extends APIGatewayRequest {
  user?: JWTPayload;
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // TODO: Move to environment variable
    const JWT_SECRET = 'your-secret-key';

    try {
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
      req.user = payload;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 