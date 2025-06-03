import fs from 'fs';

function correctLevel4And5Count() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('修正Level 4和5的题目数量...');
  console.log('=========================');
  
  // 删除Level 4的61-62题
  console.log('删除Level 4的多余题目 (61-62):');
  for (let i = 61; i <= 62; i++) {
    const key = `4-${i}`;
    if (descriptions[key]) {
      delete descriptions[key];
      console.log(`删除 ${key}`);
    }
  }
  
  // 删除Level 5的61-62题
  console.log('\n删除Level 5的多余题目 (61-62):');
  for (let i = 61; i <= 62; i++) {
    const key = `5-${i}`;
    if (descriptions[key]) {
      delete descriptions[key];
      console.log(`删除 ${key}`);
    }
  }
  
  // 保存修正后的文件
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log('\n修正完成！验证结果:');
  
  // 验证修正后的数量
  const levelCounts = [
    { level: 1, expected: 37 },
    { level: 2, expected: 42 },
    { level: 3, expected: 52 },
    { level: 4, expected: 60 }, // 修正为60
    { level: 5, expected: 60 }, // 修正为60
    { level: 6, expected: 62 },
    { level: 7, expected: 57 },
    { level: 8, expected: 57 }
  ];
  
  levelCounts.forEach(info => {
    let count = 0;
    for (let i = 1; i <= info.expected; i++) {
      if (descriptions[`${info.level}-${i}`]) count++;
    }
    console.log(`Level ${info.level}: ${count}/${info.expected}题 ${count === info.expected ? '✓' : '✗'}`);
  });
}

correctLevel4And5Count();