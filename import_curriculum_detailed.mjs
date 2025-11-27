import postgres from 'postgres';
import { readFileSync } from 'fs';

const sql = postgres('postgresql://postgres.ksgksoeubyvkuwfpdhet:yBRuGwN01HPd8XMR@aws-1-us-east-2.pooler.supabase.com:5432/postgres', {
  ssl: { rejectUnauthorized: false },
  max: 1,
  prepare: false
});

// Helper function to convert JSON array string to delimiter string
function jsonArrayToDelimited(jsonStr) {
  try {
    // Remove outer quotes and parse
    const cleaned = jsonStr.replace(/^'|'$/g, '');
    const arr = JSON.parse(cleaned);
    return arr.join('|||');
  } catch (error) {
    console.error(`Failed to parse JSON: ${jsonStr}`, error);
    return '';
  }
}

// Parse a single VALUES clause
function parseValues(valuesStr) {
  // This is a simplified parser - we'll extract values carefully
  const lines = valuesStr.trim().split('\n').map(l => l.trim());

  const data = {};
  let currentField = null;
  let valueBuffer = '';

  for (const line of lines) {
    if (line.includes('day_number') || line.includes(',')) {
      // Skip field names line
      continue;
    }

    // Extract values in order based on INSERT field list
    // day_number, tencore_skill_id, training_type, title, description,
    // original_course_ref, objectives, key_points, difficulty, order_index
  }

  return data;
}

// Import curriculum data from SQL file
async function importFromSQL(filePath, startDay, endDay) {
  console.log(`\n📖 读取文件: ${filePath}`);
  console.log(`📅 导入范围: Day ${startDay} - Day ${endDay}\n`);

  const content = readFileSync(filePath, 'utf8');

  // Extract INSERT statements - looking for patterns like "INSERT INTO ninety_day_curriculum"
  const insertPattern = /INSERT INTO ninety_day_curriculum\s*\([^)]+\)\s*VALUES\s*\(([^;]+)\);/gs;
  const matches = [...content.matchAll(insertPattern)];

  console.log(`找到 ${matches.length} 条 INSERT 语句`);

  let imported = 0;
  let skipped = 0;

  for (const match of matches) {
    const valuesStr = match[1];

    // Parse the VALUES clause manually
    // Split by "), (" to get individual value sets
    const valueSets = valuesStr.split(/\),\s*\(/);

    for (let valueSet of valueSets) {
      // Clean up the value set
      valueSet = valueSet.replace(/^\(|\)$/g, '').trim();

      // Split by comma, but be careful with commas inside strings
      const values = [];
      let current = '';
      let inString = false;
      let stringChar = null;
      let depth = 0;

      for (let i = 0; i < valueSet.length; i++) {
        const char = valueSet[i];

        if ((char === "'" || char === '"') && valueSet[i-1] !== '\\') {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
            stringChar = null;
          }
        }

        if (char === '(' && !inString) depth++;
        if (char === ')' && !inString) depth--;

        if (char === ',' && !inString && depth === 0) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      if (current.trim()) {
        values.push(current.trim());
      }

      // Now we have the values array
      if (values.length < 10) {
        console.log(`⚠️  Skipping incomplete value set (${values.length} values)`);
        continue;
      }

      // Extract and parse values
      const dayNumber = parseInt(values[0]);

      // Skip if not in our range
      if (dayNumber < startDay || dayNumber > endDay) {
        skipped++;
        continue;
      }

      // Extract skill number from the subquery
      const skillMatch = values[1].match(/skill_number\s*=\s*(\d+)/);
      const skillNumber = skillMatch ? parseInt(skillMatch[1]) : null;

      if (!skillNumber) {
        console.log(`⚠️  Day ${dayNumber}: Could not extract skill number`);
        continue;
      }

      const trainingType = values[2].replace(/^'|'$/g, '');
      const title = values[3].replace(/^'|'$/g, '');
      const description = values[4].replace(/^'|'$/g, '');
      const courseRef = values[5].replace(/^'|'$/g, '');
      const objectives = jsonArrayToDelimited(values[6]);
      const keyPoints = jsonArrayToDelimited(values[7]);
      const difficulty = values[8].replace(/^'|'$/g, '');
      const orderIndex = parseInt(values[9]);

      // Import this day
      try {
        const result = await sql`
          INSERT INTO ninety_day_curriculum (
            day_number, tencore_skill_id, training_type, title, description,
            original_course_ref, objectives, key_points, difficulty, order_index
          ) VALUES (
            ${dayNumber},
            (SELECT id FROM tencore_skills WHERE skill_number = ${skillNumber}),
            ${trainingType},
            ${title},
            ${description},
            ${courseRef},
            string_to_array(${objectives}, '|||'),
            string_to_array(${keyPoints}, '|||'),
            ${difficulty},
            ${orderIndex}
          )
          ON CONFLICT (day_number) DO NOTHING
          RETURNING day_number, title
        `;

        if (result.length > 0) {
          console.log(`✅ Day ${dayNumber}: ${title}`);
          imported++;
        } else {
          console.log(`⏭️  Day ${dayNumber}: Already exists, skipped`);
          skipped++;
        }
      } catch (error) {
        console.error(`❌ Day ${dayNumber}: Failed to import`, error.message);
      }
    }
  }

  console.log(`\n📊 导入统计:`);
  console.log(`  成功导入: ${imported} 天`);
  console.log(`  跳过: ${skipped} 天`);

  return imported;
}

// Main execution
async function main() {
  try {
    console.log('🚀 开始导入详细课程数据\n');

    // Import days 16-45 from part1
    const imported1 = await importFromSQL(
      'sql/13_insert_90day_curriculum_part1.sql',
      16,
      45
    );

    // Import days 46-90 from part2
    const imported2 = await importFromSQL(
      'sql/13_insert_90day_curriculum_part2.sql',
      46,
      90
    );

    console.log(`\n\n✅ 总共导入: ${imported1 + imported2} 天课程数据`);

    // Verify final state
    const allDays = await sql`
      SELECT day_number, title, training_type
      FROM ninety_day_curriculum
      ORDER BY day_number
    `;

    console.log(`\n📊 数据库最终状态: ${allDays.length}/90 天课程`);

    if (allDays.length === 90) {
      console.log('🎉 所有90天课程数据导入完成！');
    } else {
      console.log(`⚠️  缺失 ${90 - allDays.length} 天课程数据`);

      // Find missing days
      const existingDays = new Set(allDays.map(d => d.day_number));
      const missingDays = [];
      for (let i = 1; i <= 90; i++) {
        if (!existingDays.has(i)) {
          missingDays.push(i);
        }
      }
      console.log('缺失的天数:', missingDays.join(', '));
    }

  } catch (error) {
    console.error('❌ 导入失败:', error);
  } finally {
    await sql.end();
  }
}

main();
