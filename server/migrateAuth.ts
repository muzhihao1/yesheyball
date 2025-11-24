/// Lazy migration logic for transitioning users from self-built auth to Supabase Auth
/// This module handles the seamless migration of existing users when they log in

import { supabaseAdmin, hasSupabaseAdmin } from './supabaseAdmin.js';
import { comparePassword } from './passwordService.js';
import { storage } from './storage.js';
import type { Request, Response } from 'express';

/**
 * Migration result types
 */
export interface MigrationResult {
  success: boolean;
  migrated: boolean;
  user?: any;
  session?: any;
  error?: string;
}

/**
 * Normalize email address to lowercase and trim whitespace
 *
 * @param email - Email address to normalize
 * @returns Normalized email address
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Lazy migration endpoint handler
 *
 * This function implements the "lazy migration" strategy:
 * 1. Try to login with Supabase Auth (user already migrated)
 * 2. If fails, check if user exists in old system
 * 3. Verify old password with bcrypt
 * 4. Create user in Supabase Auth with same password
 * 5. Link Supabase user to existing profile data
 * 6. Clear old password hash
 *
 * Flow:
 * - User submits login form
 * - Frontend calls /api/auth/migrate-login
 * - If user already in Supabase Auth → login success
 * - If user in old system → migrate → login success
 * - If credentials invalid → login failure
 *
 * @param req - Express request with email and password in body
 * @param res - Express response
 */
export async function handleMigrateLogin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || typeof email !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Email is required'
      });
      return;
    }

    if (!password || typeof password !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Password is required'
      });
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    // Check if Supabase Admin is available
    if (!hasSupabaseAdmin()) {
      console.error('Supabase Admin not configured');
      res.status(500).json({
        success: false,
        error: 'Authentication service not available'
      });
      return;
    }

    // Step 1: Check if user exists in database
    console.log(`🔍 Checking database for user: ${normalizedEmail}`);

    const dbUser = await storage.getUserByEmail(normalizedEmail);

    if (!dbUser) {
      console.log(`❌ User ${normalizedEmail} not found in database`);
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Step 2: Check if user already migrated to Supabase Auth
    if (dbUser.migratedToSupabase) {
      console.log(`✅ User ${normalizedEmail} already migrated to Supabase Auth`);

      // Create Express session for backward compatibility
      const { buildSessionUser } = await import("./auth.js");
      const sessionUser = buildSessionUser(dbUser);
      req.session.user = sessionUser;
      req.user = sessionUser as any;

      console.log(`✅ Express session created for ${normalizedEmail}`);

      // Return success - frontend will handle Supabase Auth login
      res.json({
        success: true,
        migrated: true,
        message: 'User already migrated. Please proceed with login.',
      });
      return;
    }

    // Step 3: User not migrated yet, verify old password
    console.log(`🔄 User ${normalizedEmail} not migrated yet, checking old password...`);

    if (!dbUser.passwordHash) {
      console.log(`❌ User ${normalizedEmail} has no password in old system`);
      res.status(401).json({
        success: false,
        error: 'Please contact support to set up your password'
      });
      return;
    }

    // Step 4: Verify old password
    console.log(`🔐 Verifying old password for: ${normalizedEmail}`);

    const isValidPassword = await comparePassword(password, dbUser.passwordHash);

    if (!isValidPassword) {
      console.log(`❌ Invalid password for: ${normalizedEmail}`);
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Step 5: Password correct, migrate to Supabase Auth
    console.log(`🚀 Migrating user ${normalizedEmail} to Supabase Auth...`);

    const { data: newUserData, error: createError } = await supabaseAdmin!.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // Skip email verification for migrated users
      user_metadata: {
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        migratedFrom: 'legacy_auth',
        migratedAt: new Date().toISOString(),
      },
    });

    if (createError || !newUserData?.user) {
      console.error(`❌ Failed to create Supabase user for ${normalizedEmail}:`, createError);
      res.status(500).json({
        success: false,
        error: 'Migration failed. Please try again.'
      });
      return;
    }

    // Step 6: Update public.users table
    console.log(`🔗 Linking ${normalizedEmail} to Supabase user ID: ${newUserData.user.id}`);

    await storage.updateUser(dbUser.id, {
      supabaseUserId: newUserData.user.id,
      migratedToSupabase: true,
      passwordHash: null, // Clear old password hash for security
    });

    console.log(`✅ Successfully migrated ${normalizedEmail} to Supabase Auth`);

    // Create Express session for backward compatibility
    const updatedUser = await storage.getUserByEmail(normalizedEmail);
    if (updatedUser) {
      const { buildSessionUser } = await import("./auth.js");
      const sessionUser = buildSessionUser(updatedUser);
      req.session.user = sessionUser;
      req.user = sessionUser as any;

      console.log(`✅ Express session created after migration for ${normalizedEmail}`);

      // Note: MemoryStore auto-saves, no need for explicit save() call
      // DON'T return session - frontend will create its own by calling Supabase Auth
      res.json({
        success: true,
        migrated: true,
        message: 'Account upgraded to new authentication system. Please login with your credentials.',
      });
      return;
    }

    // If updatedUser not found, still return success
    res.json({
      success: true,
      migrated: true,
      message: 'Account upgraded to new authentication system. Please login with your credentials.',
    });

  } catch (error) {
    console.error('❌ Migration login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during migration'
    });
  }
}

/**
 * Check migration status for a user by email
 *
 * @param email - User email to check
 * @returns Migration status information
 */
export async function checkMigrationStatus(email: string): Promise<{
  exists: boolean;
  migrated: boolean;
  supabaseUserId?: string;
}> {
  try {
    const normalizedEmail = normalizeEmail(email);
    const user = await storage.getUserByEmail(normalizedEmail);

    if (!user) {
      return { exists: false, migrated: false };
    }

    return {
      exists: true,
      migrated: user.migratedToSupabase || false,
      supabaseUserId: user.supabaseUserId ?? undefined,
    };
  } catch (error) {
    console.error('Error checking migration status:', error);
    return { exists: false, migrated: false };
  }
}
