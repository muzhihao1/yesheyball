import fs from 'fs';

function analyzeWrongAllocations() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('错误分配分析:');
  console.log('=========================');
  
  // 检查Level 4和5的51-60题目
  console.log('Level 4的51-60题 (应该属于Level 6):');
  for (let i = 51; i <= 60; i++) {
    const key = `4-${i}`;
    if (descriptions[key]) {
      console.log(`${key}: ${descriptions[key].substring(0, 50)}...`);
    }
  }
  
  console.log('\nLevel 5的51-60题 (应该属于Level 7):');
  for (let i = 51; i <= 60; i++) {
    const key = `5-${i}`;
    if (descriptions[key]) {
      console.log(`${key}: ${descriptions[key].substring(0, 50)}...`);
    }
  }
  
  console.log('\nLevel 8的51-56题 (可能需要重新分配):');
  for (let i = 51; i <= 56; i++) {
    const key = `8-${i}`;
    if (descriptions[key]) {
      console.log(`${key}: ${descriptions[key].substring(0, 50)}...`);
    }
  }
  
  // 检查当前Level 6和7的实际题目数量
  console.log('\n当前Level 6的题目 (1-50):');
  let level6Count = 0;
  for (let i = 1; i <= 50; i++) {
    if (descriptions[`6-${i}`]) level6Count++;
  }
  console.log(`Level 6实际有${level6Count}题`);
  
  console.log('\n当前Level 7的题目 (1-40):');
  let level7Count = 0;
  for (let i = 1; i <= 40; i++) {
    if (descriptions[`7-${i}`]) level7Count++;
  }
  console.log(`Level 7实际有${level7Count}题`);
}

analyzeWrongAllocations();