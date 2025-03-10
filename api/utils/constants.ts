// RFC 5322 compliant regex that requires domain with TLD and prevents trailing dots
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+[a-zA-Z0-9]$/;
const EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE = 'Email and password are required';

export {
    EMAIL_REGEX,
    EMAIL_PASSWORD_VALIDATION_ERROR_MESSAGE,
 };