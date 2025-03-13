import bcrypt from 'bcryptjs';

export async function fetchUser(email: string): Promise<Record<string, any>> {
  // TODO: Fetch user from database using email
  // For now, we'll simulate a database response
  const mockUser = {
    email: 'test@example.com',
    password_hash: await bcrypt.hash('password123', 12),
    is_email_verified: true
  };

  // TODO: Replace with actual database lookup
  return mockUser;
} 