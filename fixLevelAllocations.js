import fs from 'fs';

function fixLevelAllocations() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('开始修正题目分配...');
  
  // 1. 将Level 4的51-60题移动到Level 6的51-60
  console.log('移动Level 4的51-60题到Level 6的51-60...');
  for (let i = 51; i <= 60; i++) {
    const oldKey = `4-${i}`;
    const newKey = `6-${i}`;
    if (descriptions[oldKey]) {
      descriptions[newKey] = descriptions[oldKey];
      delete descriptions[oldKey];
      console.log(`${oldKey} → ${newKey}`);
    }
  }
  
  // 2. 将Level 5的51-60题移动到Level 7的41-50
  console.log('\n移动Level 5的51-60题到Level 7的41-50...');
  for (let i = 51; i <= 60; i++) {
    const oldKey = `5-${i}`;
    const newKey = `7-${i - 10}`; // 51->41, 52->42, etc.
    if (descriptions[oldKey]) {
      descriptions[newKey] = descriptions[oldKey];
      delete descriptions[oldKey];
      console.log(`${oldKey} → ${newKey}`);
    }
  }
  
  // 3. 将Level 8的51-56题移动到Level 7的51-56
  console.log('\n移动Level 8的51-56题到Level 7的51-56...');
  for (let i = 51; i <= 56; i++) {
    const oldKey = `8-${i}`;
    const newKey = `7-${i}`;
    if (descriptions[oldKey]) {
      descriptions[newKey] = descriptions[oldKey];
      delete descriptions[oldKey];
      console.log(`${oldKey} → ${newKey}`);
    }
  }
  
  // 保存修正后的文件
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log('\n修正完成！检查新的分配：');
  
  // 统计修正后的数量
  for (let level = 1; level <= 8; level++) {
    let count = 0;
    for (let i = 1; i <= 100; i++) {
      const key = `${level}-${i}`;
      if (descriptions[key]) {
        count++;
      } else if (count > 0) {
        break;
      }
    }
    console.log(`Level ${level}: ${count}题`);
  }
}

fixLevelAllocations();