import fs from 'fs';

function fixToCorrectCounts() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('修正到正确的题目数量...');
  console.log('=========================');
  
  // 删除多余的题目
  const toDelete = [
    // Level 1: 删除36,37 (应该是35题)
    '1-36', '1-37',
    // Level 2: 删除41,42 (应该是40题)
    '2-41', '2-42',
    // Level 3: 删除51,52 (应该是50题)
    '3-51', '3-52',
    // Level 6: 删除61,62 (应该是60题)
    '6-61', '6-62',
    // Level 7: 删除56,57 (应该是55题)
    '7-56', '7-57',
    // Level 8: 删除56,57 (应该是55题)
    '8-56', '8-57'
  ];
  
  console.log('删除多余的题目:');
  toDelete.forEach(key => {
    if (descriptions[key]) {
      delete descriptions[key];
      console.log(`删除 ${key}`);
    }
  });
  
  // 保存修正后的文件
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log('\n修正完成！验证结果:');
  
  // 验证修正后的数量
  const correctCounts = [
    { level: 1, expected: 35 },
    { level: 2, expected: 40 },
    { level: 3, expected: 50 },
    { level: 4, expected: 60 },
    { level: 5, expected: 60 },
    { level: 6, expected: 60 },
    { level: 7, expected: 55 },
    { level: 8, expected: 55 }
  ];
  
  correctCounts.forEach(info => {
    let count = 0;
    for (let i = 1; i <= info.expected; i++) {
      if (descriptions[`${info.level}-${i}`]) count++;
    }
    console.log(`Level ${info.level}: ${count}/${info.expected}题 ${count === info.expected ? '✓' : '✗'}`);
  });
  
  // 检查是否还有超出范围的题目
  console.log('\n检查超出范围的题目:');
  Object.keys(descriptions).forEach(key => {
    const match = key.match(/^(\d+)-(\d+)$/);
    if (match) {
      const level = parseInt(match[1]);
      const exercise = parseInt(match[2]);
      const maxCount = correctCounts.find(c => c.level === level)?.expected || 0;
      
      if (exercise > maxCount) {
        console.log(`发现超出范围: ${key} (Level ${level} 最大应该是 ${maxCount})`);
      }
    }
  });
}

fixToCorrectCounts();