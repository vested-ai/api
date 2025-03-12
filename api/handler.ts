import { Request, Response } from 'express';
import serverless from 'serverless-http';
import express from 'express';
import bcrypt from 'bcryptjs';
import { createAccount, sendVerificationEmail } from './services/account';
import { verifyEmail } from './services/verification';
import { 
  EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE, 
  VERIFICATION_REQUIRED_FIELDS_ERROR,
  VERIFICATION_SUCCESS_MESSAGE 
} from './utils/constants';
import { getRequestBody } from './utils/api';
import { APIGatewayRequest } from './types/api';

const app = express();

// Add JSON body parser middleware
app.use(express.json());

interface RegisterRequestBody {
  email: string;
  password: string;
}

interface VerifyEmailBody {
  code: string;
  token: string;
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

app.post('/register', async (req: APIGatewayRequest<Record<string, never>, Record<string, never>, RegisterRequestBody>, res: Response) => {
  try {
    const { email, password } = getRequestBody<RegisterRequestBody>(req);

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE
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
    if (!result.verificationCode) {
      return res.status(500).json({ error: 'Verification code not found' });
    }

    const emailResult = await sendVerificationEmail(email, result.verificationCode!);
    
    if (typeof emailResult === 'object' && 'error' in emailResult) {
      return res.status(500).json({ error: emailResult.error });
    }

    return res.status(201).json({
      message: 'User registration successful',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

app.post('/verify-email', async (req: APIGatewayRequest<Record<string, never>, Record<string, never>, VerifyEmailBody>, res: Response) => {
  try {
    const { code, token } = getRequestBody<VerifyEmailBody>(req);

    if (!token || !code) {
      return res.status(400).json({
        error: VERIFICATION_REQUIRED_FIELDS_ERROR
      });
    }

    const result = await verifyEmail(token, code);

    if ('error' in result) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({
      message: VERIFICATION_SUCCESS_MESSAGE
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    error: 'Not Found',
  });
});

export const handler = serverless(app); 