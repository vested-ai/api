import nodemailer, { TransportOptions } from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface EmailConfig {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(config: EmailConfig): Promise<void> {
  const isLocalEnvironment = process.env.IS_OFFLINE || process.env.NODE_ENV === 'test';

  if (isLocalEnvironment) {
    // Use Mailhog for local development
    const transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025, // Default Mailhog SMTP port
      secure: false,
      ignoreTLS: true,
      auth: null
    } as TransportOptions);

    await transporter.sendMail({
      from: 'noreply@yourdomain.com',
      ...config,
    });
  } else {
    // Use AWS SES in production
    const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });
    
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
      Source: process.env.SES_FROM_EMAIL || 'noreply@yourdomain.com',
    });

    await sesClient.send(command);
  }
} 