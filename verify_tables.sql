SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'training_levels',
    'training_skills', 
    'sub_skills',
    'training_units',
    'user_training_progress',
    'specialized_trainings',
    'specialized_training_plans'
  )
ORDER BY table_name;
