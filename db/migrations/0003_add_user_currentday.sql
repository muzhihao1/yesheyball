-- Add currentDay column to users table for individual training progression tracking
-- This allows each user to have their own system training day progression
-- instead of sharing a global currentDay from the training program

ALTER TABLE users ADD COLUMN IF NOT EXISTS current_day INTEGER NOT NULL DEFAULT 1;

-- Add comment to document the column purpose
COMMENT ON COLUMN users.current_day IS 'Current training day in the system program (1-30) for individual user progression';
