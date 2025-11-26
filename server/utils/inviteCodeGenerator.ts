/**
 * Invite Code Generator Utility
 *
 * Generates unique invite codes for the referral system
 * Format: 8 characters (uppercase letters + numbers)
 * Example: "A1B2C3D4"
 */

import { db } from "../db.js";
import { users } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

/**
 * Generates a random 8-character invite code
 * Contains uppercase letters (A-Z) and numbers (0-9)
 *
 * @returns {string} An 8-character invite code (e.g., "A1B2C3D4")
 */
function generateRandomCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

/**
 * Checks if an invite code already exists in the database
 *
 * @param {string} code - The invite code to check
 * @returns {Promise<boolean>} True if code exists, false otherwise
 */
async function isCodeUnique(code: string): Promise<boolean> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.inviteCode, code))
      .limit(1);

    return existingUser.length === 0;
  } catch (error) {
    console.error('Error checking invite code uniqueness:', error);
    throw new Error('Failed to validate invite code uniqueness');
  }
}

/**
 * Generates a unique invite code by checking against the database
 * Retries up to 5 times if collision occurs (extremely rare)
 *
 * @returns {Promise<string>} A unique 8-character invite code
 * @throws {Error} If unable to generate unique code after 5 attempts
 */
export async function generateInviteCode(): Promise<string> {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const code = generateRandomCode();

    // Check if code is unique in database
    const isUnique = await isCodeUnique(code);

    if (isUnique) {
      console.log(`Generated unique invite code: ${code} (attempt ${attempt})`);
      return code;
    }

    console.warn(`Invite code collision detected: ${code} (attempt ${attempt}/${maxAttempts})`);
  }

  // If we reach here, we failed to generate a unique code after maxAttempts
  throw new Error('Failed to generate unique invite code after maximum attempts');
}
