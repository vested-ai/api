import nodemailer, { TransportOptions } from 'nodemailer';
import { 
  SESClient, 
  SendEmailCommand, 
  MessageRejected,
  SendEmailCommandOutput
} from '@aws-sdk/client-ses';
import crypto from 'crypto';
import { emailErrorCodes } from '../utils/constants';


// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

interface EmailConfig {
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface EmailError {
  code: (typeof emailErrorCodes)[keyof typeof emailErrorCodes];
  message: string;
  originalError?: any;
}

export async function sendEmail(config: EmailConfig): Promise<void | EmailError> {
  const isLocalEnvironment = process.env.IS_OFFLINE || process.env.NODE_ENV === 'test';

  if (isLocalEnvironment) {
    // Use Mailhog for local development
    const transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025, // Default Mailhog SMTP port
      secure: false,
      ignoreTLS: true,
      auth: null,
    } as TransportOptions);

    try {
      await transporter.sendMail({
        from: 'noreply@yourdomain.com',
        ...config,
      });
      console.log(`Email send via Mailhog to ${config.to}`);
    } catch (error) {
      console.error(`Error sending email via Mailhog: ${error}`);
      throw new Error(`Failed to send email: ${error}`);
    }
  } else {
    // Use AWS SES in production
    const sesClient = new SESClient({ 
      region: process.env.AWS_REGION || 'us-east-1'
    });

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [config.to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: config.html,
          },
          Text: {
            Charset: 'UTF-8',
            Data: config.text,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: config.subject,
        },
      },
      Source: process.env.SES_FROM_EMAIL || 'no-reply@mail.allvested.com',
    });

    try {
      const result: SendEmailCommandOutput = await sesClient.send(command);
      console.log(`Email sent via SES to ${config.to}`, result.MessageId);
    } catch (error) {
      if (error instanceof MessageRejected) {
        // Handle specific SES errors
        if (error.message.includes('Email address is not verified')) {
          return {
            code: emailErrorCodes.SANDBOX_RECIPIENT_NOT_VERIFIED,
            message: 'Cannot send email: recipient not verified in SES sandbox mode',
            originalError: error
          };
        }
        
        if (error.message.includes('Daily message quota exceeded')) {
          return {
            code: emailErrorCodes.DAILY_QUOTA_EXCEEDED,
            message: 'Cannot send email: daily sending quota exceeded',
            originalError: error
          };
        }
      }

      console.error(`Error sending email via SES:`, error);
      return {
        code: emailErrorCodes.GENERAL_ERROR,
        message: `Failed to send email: ${error.message}`,
        originalError: error
      };
    }
  }
}
