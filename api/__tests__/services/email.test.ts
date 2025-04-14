import { sendEmail } from '../../services/email';
import nodemailer from 'nodemailer';
import { emailErrorCodes } from '../../utils/constants';

// Mock nodemailer
jest.mock('nodemailer');

describe('Email Service', () => {
  // Save original env and mock for local testing
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = {
      ...originalEnv,
      IS_OFFLINE: 'true',
      NODE_ENV: 'test'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should send email successfully via Mailhog', async () => {
    const mockSendMail = jest.fn().mockResolvedValue(true);
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail
    });

    const emailConfig = {
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'Test content',
      html: '<p>Test content</p>'
    };

    await sendEmail(emailConfig);

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: emailConfig.to,
        subject: emailConfig.subject,
        text: emailConfig.text,
        html: emailConfig.html
      })
    );
  });
}); 