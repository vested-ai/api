// RFC 5322 compliant regex that requires domain with TLD and prevents trailing dots
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+[a-zA-Z0-9]$/;
const EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE = 'Email and password are required';
const EMAIL_SERVICE_UNAVAILABLE_ERROR_MESSAGE = 'Email service unavailable';
const VERIFICATION_ERROR_MESSAGE = 'Invalid or expired verification token';
const VERIFICATION_REQUIRED_FIELDS_ERROR = 'Verification token and code are required';
const VERIFICATION_FAILED_ERROR = 'Failed to verify email';
const VERIFICATION_SUCCESS_MESSAGE = 'Email verification successful';

export {
    EMAIL_REGEX,
    EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE,
    EMAIL_SERVICE_UNAVAILABLE_ERROR_MESSAGE,
    VERIFICATION_ERROR_MESSAGE,
    VERIFICATION_REQUIRED_FIELDS_ERROR,
    VERIFICATION_FAILED_ERROR,
    VERIFICATION_SUCCESS_MESSAGE
};