-- Migration 39: Make start_date nullable in user_ninety_day_progress
--
-- Problem: start_date was defined as NOT NULL with DEFAULT NOW(), which caused
-- automatic initialization of challenge start date when users accessed the page
--
-- Solution: Remove NOT NULL constraint and DEFAULT, allowing start_date to be
-- NULL until user explicitly clicks "Start Challenge" button
--
-- Date: 2025-11-14

-- Step 1: Drop DEFAULT constraint
ALTER TABLE user_ninety_day_progress
ALTER COLUMN start_date DROP DEFAULT;

-- Step 2: Make start_date nullable
ALTER TABLE user_ninety_day_progress
ALTER COLUMN start_date DROP NOT NULL;

-- Step 3: Clear start_date for users who haven't started training
-- (Users with no training records and zero completed days)
UPDATE user_ninety_day_progress up
SET
  start_date = NULL,
  estimated_completion_date = NULL
WHERE
  up.start_date IS NOT NULL
  AND (
    SELECT COUNT(*) FROM ninety_day_training_records r
    WHERE r.user_id = up.user_id
  ) = 0
  AND (
    up.completed_days IS NULL
    OR jsonb_array_length(up.completed_days::jsonb) = 0
  );

-- Verification query (optional - comment out in production)
-- SELECT
--   user_id,
--   start_date,
--   (SELECT COUNT(*) FROM ninety_day_training_records r WHERE r.user_id = up.user_id) as training_count,
--   CASE
--     WHEN completed_days IS NULL THEN 0
--     ELSE jsonb_array_length(completed_days::jsonb)
--   END as completed_count
-- FROM user_ninety_day_progress up;
