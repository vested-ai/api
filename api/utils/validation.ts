export function isValidEmail(email: string): boolean {
return Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+[^\s@\.]$/.test(email));
} 