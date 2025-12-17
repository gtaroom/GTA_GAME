// Generate an easy password for users
export const generateEasyPassword = (): string => {
  // Generate a simple 6-character password with numbers and letters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Generate username from email
export const generateUsernameFromEmail = (email: string): string => {
  return email.split('@')[0];
};

// Validate game account credentials
export const validateGameCredentials = (username: string, password: string): boolean => {
  if (!username || !password) return false;
  if (username.length < 3) return false;
  if (password.length < 4) return false;
  return true;
}; 