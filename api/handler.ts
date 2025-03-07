import { Request, Response } from 'express';
import serverless from 'serverless-http';
import express from 'express';
import bcrypt from 'bcryptjs';
import { createAccount, sendVerificationEmail } from './services/account';

const app = express();

// Add JSON body parser middleware
app.use(express.json());

interface RegisterRequestBody {
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

app.post('/register', async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Hash the password with a minimum cost factor for security
    const SALT_ROUNDS = 12; // Industry standard minimum for security
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    console.log(hash);
    
    // TODO: Save user to database
    const result = await createAccount(email, password);
    
    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(email, result.verificationCode!);
    if (typeof emailResult === 'object' && 'error' in emailResult) {
      return res.status(500).json({ error: emailResult.error });
    }

    return res.status(201).json({
      message: 'User registration successful',
    });
  } catch (error) {
    console.error('Registration error:', error);
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