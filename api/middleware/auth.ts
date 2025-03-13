import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { APIGatewayRequest } from '../types/api';
import { config } from '../config/env';

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
    const csrfToken = req.headers['x-csrf-token'];
    const cookieCsrfToken = req.cookies['csrf-token'];

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify CSRF token matches cookie
    if (!csrfToken || !cookieCsrfToken || csrfToken !== cookieCsrfToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const payload = jwt.verify(token, config.jwt.secret) as JWTPayload;
      req.user = payload;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expired' });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid token' });
      } else {
        return res.status(401).json({ error: 'Toke verification failed'});
      }
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 