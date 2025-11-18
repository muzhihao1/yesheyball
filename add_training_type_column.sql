-- Add missing training_type column to ninety_day_training_records table
-- This column is required by the application code but missing from the database

ALTER TABLE ninety_day_training_records
ADD COLUMN IF NOT EXISTS training_type varchar(20) NOT NULL DEFAULT '系统';

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'ninety_day_training_records'
AND column_name = 'training_type';
