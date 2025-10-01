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

    // Step 1: Try Supabase Auth login first
    console.log(`🔍 Attempting Supabase Auth login for: ${normalizedEmail}`);

    const { data: signInData, error: signInError } = await supabaseAdmin!.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInData?.user && signInData?.session) {
      // Success: User already migrated
      console.log(`✅ User ${normalizedEmail} already migrated, login successful`);
      res.json({
        success: true,
        migrated: true,
        user: signInData.user,
        session: signInData.session,
      });
      return;
    }

    // Step 2: Supabase login failed, check old system
    console.log(`🔄 Checking old system for: ${normalizedEmail}`);

    const oldUser = await storage.getUserByEmail(normalizedEmail);

    if (!oldUser) {
      console.log(`❌ User ${normalizedEmail} not found in old system`);
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    if (!oldUser.passwordHash) {
      console.log(`❌ User ${normalizedEmail} has no password in old system`);
      res.status(401).json({
        success: false,
        error: 'Please contact support to set up your password'
      });
      return;
    }

    // Step 3: Verify old password
    console.log(`🔐 Verifying old password for: ${normalizedEmail}`);

    const isValidPassword = await comparePassword(password, oldUser.passwordHash);

    if (!isValidPassword) {
      console.log(`❌ Invalid password for: ${normalizedEmail}`);
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Step 4: Password correct, migrate to Supabase Auth
    console.log(`🚀 Migrating user ${normalizedEmail} to Supabase Auth...`);

    const { data: newUserData, error: createError } = await supabaseAdmin!.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // Skip email verification for migrated users
      user_metadata: {
        firstName: oldUser.firstName,
        lastName: oldUser.lastName,
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

    // Step 5: Update public.users table
    console.log(`🔗 Linking ${normalizedEmail} to Supabase user ID: ${newUserData.user.id}`);

    await storage.updateUser(oldUser.id, {
      supabaseUserId: newUserData.user.id,
      migratedToSupabase: true,
      passwordHash: null, // Clear old password hash for security
    });

    // Step 6: Generate session for immediate login
    console.log(`🎟️ Generating session for ${normalizedEmail}`);

    const { data: sessionData, error: sessionError } = await supabaseAdmin!.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (sessionError || !sessionData?.session) {
      console.error(`❌ Failed to create session for ${normalizedEmail}:`, sessionError);
      // User is migrated but can't login immediately - they'll succeed on next attempt
      res.json({
        success: true,
        migrated: true,
        message: 'Account migrated successfully. Please login again.',
      });
      return;
    }

    console.log(`✅ Successfully migrated ${normalizedEmail} to Supabase Auth`);

    res.json({
      success: true,
      migrated: true,
      user: sessionData.user,
      session: sessionData.session,
      message: 'Account upgraded to new authentication system',
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
      supabaseUserId: user.supabaseUserId,
    };
  } catch (error) {
    console.error('Error checking migration status:', error);
    return { exists: false, migrated: false };
  }
}
