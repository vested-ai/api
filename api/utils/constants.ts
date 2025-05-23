// RFC 5322 compliant regex that requires domain with TLD and prevents trailing dots
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+[a-zA-Z0-9]$/;
const EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE = 'Email and password are required';
const EMAIL_SERVICE_UNAVAILABLE_ERROR_MESSAGE = 'Email service unavailable';
const VERIFICATION_ERROR_MESSAGE = 'Invalid or expired verification token';
const VERIFICATION_REQUIRED_FIELDS_ERROR = 'Email, registration token and code are required';
const VERIFICATION_FAILED_ERROR = 'Failed to verify email';
const VERIFICATION_SUCCESS_MESSAGE = 'Email verification successful';

export const INVALID_CREDENTIALS_ERROR = 'Invalid email or password';
export const EMAIL_NOT_VERIFIED_ERROR =
  'Email not verified. Please verify your email before logging in';

export const NO_TOKEN_ERROR = 'No token provided';
export const INVALID_TOKEN_ERROR = 'Invalid token';

const emailErrorCodes = {
  SANDBOX_RECIPIENT_NOT_VERIFIED: 'SANDBOX_RECIPIENT_NOT_VERIFIED',
  DAILY_QUOTA_EXCEEDED: 'DAILY_QUOTA_EXCEEDED',
  GENERAL_ERROR: 'GENERAL_ERROR',
};

export {
  EMAIL_REGEX,
  EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE,
  EMAIL_SERVICE_UNAVAILABLE_ERROR_MESSAGE,
  VERIFICATION_ERROR_MESSAGE,
  VERIFICATION_REQUIRED_FIELDS_ERROR,
  VERIFICATION_FAILED_ERROR,
  VERIFICATION_SUCCESS_MESSAGE,
  emailErrorCodes,
};
