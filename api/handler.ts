import { Request, Response } from 'express';
import serverless from 'serverless-http';
import express from 'express';
import bcrypt from 'bcryptjs';
import { createAccount, sendVerificationEmail } from './services/account';
import { verifyEmail } from './services/verification';
import { authenticateUser } from './services/auth';
import {
  EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE,
  VERIFICATION_REQUIRED_FIELDS_ERROR,
  VERIFICATION_SUCCESS_MESSAGE,
  INVALID_CREDENTIALS_ERROR,
  EMAIL_NOT_VERIFIED_ERROR,
} from './utils/constants';
import { getRequestBody } from './utils/api';
import { APIGatewayRequest } from './types/api';
import { authenticateJWT, AuthenticatedRequest } from './middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';

require('dotenv').config();
const app = express();

// Add JSON body parser middleware
app.use(express.json());
app.use(cookieParser());

// Add CORS headers for local development
if (process.env.NODE_ENV !== 'production') {
  app.use((_req: Request, res: Response, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    next();
  });
}

interface RegisterRequestBody {
  email: string;
  password: string;
}

interface VerifyEmailBody {
  code: string;
  token: string;
  email: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

app.get('/', (_req: Request, res: Response) => {
  return res.status(200).json({
    message: 'Hello from root!',
  });
});

app.get('/hello', (_req: Request, res: Response) => {
  return res.status(200).json({
    message: 'Hello from path!',
  });
});

app.post(
  '/register',
  async (
    req: APIGatewayRequest<Record<string, never>, Record<string, never>, RegisterRequestBody>,
    res: Response,
  ) => {
    try {
      const { email, password } = getRequestBody<RegisterRequestBody>(req);

      // Basic validation
      if (!email || !password) {
        return res.status(400).json({
          error: EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE,
        });
      }

      // Hash the password with a minimum cost factor for security
      const SALT_ROUNDS = 12; // Industry standard minimum for security
      const hash = await bcrypt.hash(password, SALT_ROUNDS);

      // TODO: Save user to database
      const result = await createAccount(email, hash);

      if ('error' in result) {
        return res.status(400).json({ error: result.error });
      }

      // Send verification email
      if (!result.registrationToken) {
        return res.status(500).json({ error: 'Verification code not found' });
      }

      const emailResult = await sendVerificationEmail(email, result.registrationToken!);

      if (typeof emailResult === 'object' && 'error' in emailResult) {
        return res.status(500).json({ error: emailResult.error });
      }

      return res.status(201).json({
        message: 'User registration successful',
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
);

app.post(
  '/verify-email',
  async (
    req: APIGatewayRequest<Record<string, never>, Record<string, never>, VerifyEmailBody>,
    res: Response,
  ) => {
    try {
      const { code, token, email } = getRequestBody<VerifyEmailBody>(req);

      if (!token || !code || !email) {
        return res.status(400).json({
          error: VERIFICATION_REQUIRED_FIELDS_ERROR,
        });
      }

      const result = await verifyEmail(email, token, code);

      if ('error' in result) {
        return res.status(500).json({ error: result.error });
      }

      return res.status(200).json({
        message: VERIFICATION_SUCCESS_MESSAGE,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
);

app.post(
  '/login',
  async (
    req: APIGatewayRequest<Record<string, never>, Record<string, never>, LoginRequestBody>,
    res: Response,
  ) => {
    try {
      const { email, password } = getRequestBody<LoginRequestBody>(req);

      // Basic validation
      if (!email || !password) {
        return res.status(400).json({
          error: EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE,
        });
      }

      const authResult = await authenticateUser(email, password);

      if ('error' in authResult) {
        if (authResult.error === 'not_verified') {
          return res.status(403).json({ error: EMAIL_NOT_VERIFIED_ERROR });
        }
        return res.status(401).json({ error: INVALID_CREDENTIALS_ERROR });
      }

      // Generate CSRF token
      const csrfToken = uuidv4();

      // Set CSRF cookie - httpOnly: false so JS can read it
      res.cookie('csrf-token', csrfToken, {
        httpOnly: false,
        secure: true,
        sameSite: 'strict',
      });

      return res.status(200).json({
        token: authResult.token,
        csrfToken, // Send token in response body too
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
);

// Example of a protected route
app.get('/protected', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // req.user contains the decoded JWT payload
    return res.status(200).json({
      message: `Hello ${req.user?.email}!`,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    error: 'Not Found',
  });
});

export const handler = serverless(app);
