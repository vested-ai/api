import { EMAIL_REGEX } from './constants';

export function isValidEmail(email: string): boolean {
  return Boolean(email && EMAIL_REGEX.test(email));
}
