// RFC 5322 compliant regex that requires domain with TLD and prevents trailing dots
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+[a-zA-Z0-9]$/;
const EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE = 'Email and password are required';
const EMAIL_SERVICE_UNAVAILABLE_ERROR_MESSAGE = 'Email service unavailable';
const VERIFICATION_ERROR_MESSAGE = 'Invalid or expired verification token';

export {
    EMAIL_REGEX,
    EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE,
    EMAIL_SERVICE_UNAVAILABLE_ERROR_MESSAGE,
    VERIFICATION_ERROR_MESSAGE
};