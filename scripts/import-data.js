import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read JSON files
const downloadsPath = '/Users/liasiloam/Downloads';
const users = JSON.parse(fs.readFileSync(path.join(downloadsPath, 'users.json'), 'utf8'));
const programs = JSON.parse(fs.readFileSync(path.join(downloadsPath, 'training_programs.json'), 'utf8'));
const trainingDays = JSON.parse(fs.readFileSync(path.join(downloadsPath, 'training_days.json'), 'utf8'));
const sessions = JSON.parse(fs.readFileSync(path.join(downloadsPath, 'training_sessions.json'), 'utf8'));

let sql = '-- Import existing data\n\n';

// Import users
sql += '-- Users\n';
users.forEach(u => {
  const email = u.email ? `'${u.email}'` : 'NULL';
  const firstName = u.first_name ? `'${u.first_name}'` : 'NULL';
  const lastName = u.last_name ? `'${u.last_name}'` : 'NULL';
  const profileImg = u.profile_image_url ? `'${u.profile_image_url}'` : 'NULL';
  const username = u.username ? `'${u.username}'` : 'NULL';

  sql += `INSERT INTO users (id, email, first_name, last_name, profile_image_url, username, level, exp, streak, total_days, completed_tasks, total_time, achievements, current_level, current_exercise, completed_exercises, created_at, last_active_at) VALUES (
    '${u.id}',
    ${email},
    ${firstName},
    ${lastName},
    ${profileImg},
    ${username},
    ${u.level},
    ${u.exp},
    ${u.streak},
    ${u.total_days},
    ${u.completed_tasks},
    ${u.total_time},
    '${JSON.stringify(u.achievements)}'::jsonb,
    ${u.current_level},
    ${u.current_exercise},
    '${JSON.stringify(u.completed_exercises)}'::jsonb,
    '${u.created_at}',
    '${u.last_active_at}'
  ) ON CONFLICT (id) DO UPDATE SET
    level = EXCLUDED.level,
    exp = EXCLUDED.exp,
    streak = EXCLUDED.streak,
    total_days = EXCLUDED.total_days,
    completed_tasks = EXCLUDED.completed_tasks,
    total_time = EXCLUDED.total_time,
    achievements = EXCLUDED.achievements,
    current_level = EXCLUDED.current_level,
    current_exercise = EXCLUDED.current_exercise,
    completed_exercises = EXCLUDED.completed_exercises,
    last_active_at = EXCLUDED.last_active_at;
`;
});

// Import training programs
sql += '\n-- Training Programs\n';
programs.forEach(p => {
  sql += `INSERT INTO training_programs (id, name, description, total_days, current_day, difficulty, created_at) VALUES (
    ${p.id},
    '${p.name.replace(/'/g, "''")}',
    '${p.description.replace(/'/g, "''")}',
    ${p.total_days},
    ${p.current_day},
    '${p.difficulty}',
    '${p.created_at}'
  ) ON CONFLICT (id) DO UPDATE SET
    current_day = EXCLUDED.current_day;
`;
});

// Import training days (BEFORE sessions due to FK constraint)
sql += `\n-- Training Days (${trainingDays.length} records)\n`;
trainingDays.forEach(d => {
  const title = d.title.replace(/'/g, "''");
  const description = d.description.replace(/'/g, "''");
  const objectives = d.objectives.map(o => o.replace(/'/g, "''"));
  const keyPoints = d.key_points ? d.key_points.map(k => k.replace(/'/g, "''")) : [];

  sql += `INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    ${d.id},
    ${d.program_id},
    ${d.day},
    '${title}',
    '${description}',
    ARRAY[${objectives.map(o => `'${o}'`).join(', ')}],
    ${keyPoints.length > 0 ? `ARRAY[${keyPoints.map(k => `'${k}'`).join(', ')}]` : 'NULL'},
    ${d.estimated_duration || 'NULL'}
  ) ON CONFLICT (id) DO NOTHING;
`;
});

// Import ALL training sessions
sql += `\n-- Training Sessions (${sessions.length} records)\n`;
sessions.forEach(s => {
  const notes = s.notes ? s.notes.replace(/'/g, "''").replace(/\\/g, '\\\\') : '';
  const title = s.title.replace(/'/g, "''");
  const desc = s.description ? s.description.replace(/'/g, "''") : '';
  const feedback = s.ai_feedback ? s.ai_feedback.replace(/'/g, "''").replace(/\\/g, '\\\\') : '';

  sql += `INSERT INTO training_sessions (id, user_id, program_id, day_id, title, description, notes, duration, rating, completed, session_type, ai_feedback, created_at, completed_at) VALUES (
    ${s.id},
    '${s.user_id}',
    ${s.program_id || 'NULL'},
    ${s.day_id || 'NULL'},
    '${title}',
    ${desc ? `'${desc}'` : 'NULL'},
    ${notes ? `'${notes}'` : 'NULL'},
    ${s.duration || 'NULL'},
    ${s.rating || 'NULL'},
    ${s.completed},
    '${s.session_type}',
    ${feedback ? `'${feedback}'` : 'NULL'},
    '${s.created_at}',
    ${s.completed_at ? `'${s.completed_at}'` : 'NULL'}
  ) ON CONFLICT (id) DO NOTHING;
`;
});

// Reset sequences
sql += `\n-- Reset sequences\n`;
sql += `SELECT setval('training_sessions_id_seq', (SELECT MAX(id) FROM training_sessions));\n`;
sql += `SELECT setval('training_programs_id_seq', (SELECT MAX(id) FROM training_programs));\n`;

console.log(sql);
