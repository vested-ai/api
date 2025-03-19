import nodemailer, { TransportOptions } from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import crypto from 'crypto';

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

export async function sendEmail(config: EmailConfig): Promise<void> {
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

    try {
      await sesClient.send(command);
      console.log(`Email send via SES to ${config.to}`);
    } catch (error) {
      console.error(`Error sending email via SES: ${error}`);
      throw new Error(`Failed to send email: ${error}`);
    }
  }
}
