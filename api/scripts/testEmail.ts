import { sendEmail } from '../services/email';
import dotenv from 'dotenv';

dotenv.config();

async function testEmailSending() {
  try {
    const result = await sendEmail({
      to: process.argv[2] || process.env.TEST_EMAIL!,
      subject: 'Test Email from AllVested',
      text: 'This is a test email from the AllVested platform.',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from the AllVested platform.</p>
        <p>If you received this, email sending is working correctly!</p>
      `
    });

    if (result) {
      console.log('Email sending failed:', result);
    } else {
      console.log('Email sent successfully!');
    }
  } catch (error) {
    console.error('Error running test:', error);
  }
}

testEmailSending(); 