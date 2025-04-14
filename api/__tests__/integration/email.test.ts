import { sendEmail } from '../../services/email';
import { emailErrorCodes } from '../../utils/constants';

describe('SES Integration Tests', () => {
  // These tests should only run when specifically requested
  // as they will actually send emails
  const runIntegrationTests = process.env.RUN_EMAIL_INTEGRATION_TESTS === 'true';
  
  beforeAll(() => {
    if (!runIntegrationTests) {
      console.log('Skipping SES integration tests. Set RUN_EMAIL_INTEGRATION_TESTS=true to run.');
    }
  });

beforeEach(() => {
  // Skip tests if integration tests are not enabled
  if (!runIntegrationTests) {
    return;
  }
  
  // Ensure TEST_VERIFIED_EMAIL is set
  if (!process.env.TEST_VERIFIED_EMAIL) {
    throw new Error('TEST_VERIFIED_EMAIL environment variable must be set to run this test');
  }
});

it('should send email via SES to verified address', async () => {    
  if (!runIntegrationTests) {
    return;
  }
    
  const result = await sendEmail({
    to: process.env.TEST_VERIFIED_EMAIL!, // Use a verified test email
    subject: 'Integration Test',
    text: 'This is an integration test email',
    html: '<p>This is an integration test email</p>'
  });

  expect(result).toBeUndefined(); // Success returns void
});

  it('should handle unverified recipient in sandbox mode', async () => {
    const result = await sendEmail({
      to: 'unverified@example.com',
      subject: 'Should Fail',
      text: 'This should fail in sandbox mode',
      html: '<p>This should fail in sandbox mode</p>'
    });

    expect(result).toEqual(
      expect.objectContaining({
        code: emailErrorCodes.SANDBOX_RECIPIENT_NOT_VERIFIED
      })
    );
  });
}); 