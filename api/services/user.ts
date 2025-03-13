import bcrypt from 'bcryptjs';

interface User {
  email: string;
  password_hash: string;
  is_email_verified: boolean;
}

export async function fetchUser(email: string): Promise<User | null> {
  // TODO: Fetch user from database using email
  // For now, we'll simulate a database response
  
  // For development only - in production we'd lookup the user in a database
  if (email !== 'test@example.com') {
    return null; // User not found
  }
  
  const mockUser = {
    email: 'test@example.com',
    password_hash: await bcrypt.hash('password123', 12),
    is_email_verified: true
  };

  // TODO: Replace with actual database lookup
  return mockUser;
} 