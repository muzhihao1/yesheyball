-- Migration: Add email/password authentication support
-- Date: 2025-10-01
-- Description: Adds password_hash column to users table for email/password authentication

-- Add password_hash column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.password_hash IS
  'Bcrypt hashed password for email/password authentication. '
  'Nullable to support users who registered via other methods (e.g., OAuth). '
  'Hash format: $2b$12$... (bcrypt with 12 rounds)';

-- Create index for faster lookups (optional, but recommended for performance)
-- Email is already indexed via UNIQUE constraint, so this is not strictly necessary
-- but can improve query performance on joins
CREATE INDEX IF NOT EXISTS idx_users_password_hash
ON users (password_hash)
WHERE password_hash IS NOT NULL;

-- Verification query (run this to confirm migration success)
-- Expected result: Should show password_hash column with data_type = 'text' and is_nullable = 'YES'
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name = 'password_hash';

-- Example: Set password for an existing user (OPTIONAL - only for testing)
-- This is a bcrypt hash of 'TestPassword123'
-- Uncomment and modify email to use:
-- UPDATE users
-- SET password_hash = '$2b$12$LQ5h4YxZ9FQkE8X.m6y6JeU5mKZGHvN7hV8dC6xJ4YqZH3M2nO1Gy'
-- WHERE email = 'your-email@example.com';

-- Stats query: Check how many users have passwords vs. don't
SELECT
  COUNT(*) FILTER (WHERE password_hash IS NOT NULL) as users_with_password,
  COUNT(*) FILTER (WHERE password_hash IS NULL) as users_without_password,
  COUNT(*) as total_users
FROM users;
