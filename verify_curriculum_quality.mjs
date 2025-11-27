import postgres from 'postgres';

const sql = postgres('postgresql://postgres.ksgksoeubyvkuwfpdhet:yBRuGwN01HPd8XMR@aws-1-us-east-2.pooler.supabase.com:5432/postgres', {
  ssl: { rejectUnauthorized: false },
  max: 1,
  prepare: false
});

async function verifyCurriculumQuality() {
  console.log('🔍 验证课程数据质量\n');

  // Check sample days from different ranges
  const sampleDays = [1, 15, 16, 30, 45, 60, 75, 90];

  for (const dayNum of sampleDays) {
    const result = await sql`
      SELECT
        day_number,
        title,
        description,
        objectives,
        key_points,
        original_course_ref,
        difficulty
      FROM ninety_day_curriculum
      WHERE day_number = ${dayNum}
    `;

    if (result.length === 0) {
      console.log(`❌ Day ${dayNum}: 数据缺失\n`);
      continue;
    }

    const day = result[0];
    console.log(`✅ Day ${dayNum}: ${day.title}`);
    console.log(`   描述: ${day.description.substring(0, 60)}...`);
    console.log(`   课程参考: ${day.original_course_ref}`);
    console.log(`   难度: ${day.difficulty}`);
    console.log(`   训练目标 (${day.objectives.length}项): ${day.objectives.slice(0, 2).join(', ')}...`);
    console.log(`   关键要点 (${day.key_points.length}项): ${day.key_points.slice(0, 2).join(', ')}...`);
    console.log('');
  }

  // Get statistics
  const stats = await sql`
    SELECT
      COUNT(*) as total_days,
      COUNT(DISTINCT tencore_skill_id) as unique_skills,
      AVG(array_length(objectives, 1)) as avg_objectives,
      AVG(array_length(key_points, 1)) as avg_key_points
    FROM ninety_day_curriculum
  `;

  console.log('📊 数据统计:');
  console.log(`   总天数: ${stats[0].total_days}/90`);
  console.log(`   涉及技能数: ${stats[0].unique_skills}/10`);
  console.log(`   平均训练目标数: ${Math.round(stats[0].avg_objectives * 10) / 10} 项`);
  console.log(`   平均关键要点数: ${Math.round(stats[0].avg_key_points * 10) / 10} 项`);

  // Check for any generic/placeholder content
  const genericCheck = await sql`
    SELECT day_number, title, description
    FROM ninety_day_curriculum
    WHERE
      description LIKE '%学习和练习%技术，提升相应能力%'
      OR title LIKE '%训练（第%天）' AND description LIKE '%学习和练习%'
    ORDER BY day_number
  `;

  if (genericCheck.length > 0) {
    console.log(`\n⚠️  发现 ${genericCheck.length} 天可能含有简化内容:`);
    genericCheck.forEach(day => {
      console.log(`   Day ${day.day_number}: ${day.title}`);
    });
  } else {
    console.log('\n✅ 所有课程数据均为详细内容，无简化数据');
  }

  await sql.end();
}

verifyCurriculumQuality();
