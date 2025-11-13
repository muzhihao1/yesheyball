/**
 * Verification Script for Skills 2-10 Data
 *
 * Checks that all sub_skills and training_units were inserted correctly
 */

import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  process.exit(1);
}

const db = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1,
});

try {
  console.log('🔍 Verifying skills data...\n');

  // Check sub_skills count per skill
  const subSkillsCount = await db`
    SELECT s.id, s.title, COUNT(ss.id) as sub_skills_count
    FROM skills s
    LEFT JOIN sub_skills ss ON s.id = ss.skill_id
    GROUP BY s.id, s.title, s.skill_order
    ORDER BY s.skill_order
  `;

  console.log('📊 Sub-skills count per skill:');
  console.table(subSkillsCount.map(row => ({
    '技能ID': row.id,
    '技能名称': row.title,
    '子技能数量': row.sub_skills_count
  })));

  // Check training_units count per skill
  const trainingUnitsCount = await db`
    SELECT s.id, s.title, COUNT(tu.id) as units_count
    FROM skills s
    LEFT JOIN sub_skills ss ON s.id = ss.skill_id
    LEFT JOIN training_units tu ON ss.id = tu.sub_skill_id
    GROUP BY s.id, s.title, s.skill_order
    ORDER BY s.skill_order
  `;

  console.log('\n📚 Training units count per skill:');
  console.table(trainingUnitsCount.map(row => ({
    '技能ID': row.id,
    '技能名称': row.title,
    '训练单元数量': row.units_count
  })));

  // Total statistics
  const totalStats = await db`
    SELECT
      (SELECT COUNT(*) FROM skills) as total_skills,
      (SELECT COUNT(*) FROM sub_skills) as total_sub_skills,
      (SELECT COUNT(*) FROM training_units) as total_training_units
  `;

  console.log('\n✅ Total statistics:');
  console.table([{
    '总技能数': totalStats[0].total_skills,
    '总子技能数': totalStats[0].total_sub_skills,
    '总训练单元数': totalStats[0].total_training_units
  }]);

  // Expected values
  const expectedSubSkills = 30; // 10 skills × 3 sub_skills each
  const expectedUnitsMin = 60;  // Approximately 6 units per skill × 10

  if (totalStats[0].total_sub_skills >= expectedSubSkills) {
    console.log(`\n✅ Sub-skills count OK: ${totalStats[0].total_sub_skills} >= ${expectedSubSkills}`);
  } else {
    console.log(`\n⚠️  Sub-skills count LOW: ${totalStats[0].total_sub_skills} < ${expectedSubSkills}`);
  }

  if (totalStats[0].total_training_units >= expectedUnitsMin) {
    console.log(`✅ Training units count OK: ${totalStats[0].total_training_units} >= ${expectedUnitsMin}`);
  } else {
    console.log(`⚠️  Training units count LOW: ${totalStats[0].total_training_units} < ${expectedUnitsMin}`);
  }

  console.log('\n🎉 Data verification completed!');

} catch (error) {
  console.error('❌ Verification failed:', error);
  process.exit(1);
} finally {
  await db.end();
}
