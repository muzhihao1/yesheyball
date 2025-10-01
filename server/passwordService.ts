/// Password hashing and verification utilities using bcrypt
/// Provides secure password management for email/password authentication

import bcrypt from 'bcryptjs';

// Bcrypt work factor (cost) - higher is more secure but slower
// 12 rounds is recommended for good security without excessive latency
const BCRYPT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt
 *
 * @param password - The plaintext password to hash
 * @returns Promise resolving to the bcrypt hash string
 * @throws Error if hashing fails
 *
 * @example
 * const hash = await hashPassword('mySecurePassword123');
 * // hash: '$2b$12$...' (60 character bcrypt hash)
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  try {
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare a plaintext password with a bcrypt hash
 *
 * @param password - The plaintext password to verify
 * @param hash - The bcrypt hash to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 *
 * @example
 * const isValid = await comparePassword('myPassword', storedHash);
 * if (isValid) {
 *   // Password is correct
 * }
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }

  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
}

/**
 * Validate password strength requirements
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one letter (a-z or A-Z)
 * - At least one number (0-9)
 *
 * @param password - The password to validate
 * @returns Object with isValid boolean and optional error message
 *
 * @example
 * const validation = validatePasswordStrength('weak');
 * if (!validation.isValid) {
 *   console.log(validation.error);
 * }
 */
export function validatePasswordStrength(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  return { isValid: true };
}
