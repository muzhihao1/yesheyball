import postgres from 'postgres';

const sql = postgres('postgresql://postgres.ksgksoeubyvkuwfpdhet:yBRuGwN01HPd8XMR@aws-1-us-east-2.pooler.supabase.com:5432/postgres', {
  ssl: { rejectUnauthorized: false },
  max: 1,
  prepare: false
});

try {
  console.log('🗑️  删除第16-90天的简化数据...');
  const deleted = await sql`
    DELETE FROM ninety_day_curriculum
    WHERE day_number >= 16 AND day_number <= 90
    RETURNING day_number
  `;
  console.log(`✅ 已删除 ${deleted.length} 天的简化数据`);

  // Verify remaining data
  const remaining = await sql`
    SELECT day_number, title
    FROM ninety_day_curriculum
    ORDER BY day_number
  `;
  console.log(`\n📊 数据库当前状态: ${remaining.length} 天课程`);
  remaining.forEach(r => console.log(`  Day ${r.day_number}: ${r.title}`));

} catch (error) {
  console.error('❌ 删除失败:', error.message);
} finally {
  await sql.end();
}
