import fs from 'fs';

function fixedProgressCalculation() {
  const descriptions = JSON.parse(fs.readFileSync('client/src/data/exerciseDescriptions.json', 'utf8'));
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  console.log('=== 修正进度计算 ===');
  
  let totalAuth = 0, totalEx = 0;
  
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    let missing = [];
    
    for (let i = 1; i <= levelCounts[level]; i++) {
      const key = `${level}-${i}`;
      const desc = descriptions[key];
      
      // 更严格的有效性检查
      if (desc && 
          desc.length >= 10 &&  // 最小长度要求
          !desc.includes('如图示摆放球型，完成') && 
          !desc.includes('精进台球技能练习') &&
          !desc.includes('高级台球技巧训练') &&
          !desc.includes('高级台球技巧练习') &&  // 添加更多过滤
          !desc.includes('台球技巧练习') &&
          desc !== '如图摆放球型，完成指定要求') {
        authentic++;
      } else {
        missing.push(i);
      }
    }
    
    totalAuth += authentic;
    totalEx += levelCounts[level];
    
    const pct = (authentic/levelCounts[level]*100).toFixed(1);
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${pct}%)`);
    
    if (missing.length > 0 && missing.length <= 10) {
      console.log(`  缺失: ${missing.join(', ')}`);
    } else if (missing.length > 10) {
      console.log(`  缺失: ${missing.slice(0, 10).join(', ')}... (共${missing.length}个)`);
    }
  });
  
  console.log(`\n总体: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%)`);
  console.log(`剩余: ${totalEx - totalAuth} 个练习`);
  
  // 检查是否已经完成
  if (totalAuth === totalEx) {
    console.log('\n🎉 所有340个练习已完成！');
  } else {
    console.log(`\n仍需完成 ${totalEx - totalAuth} 个练习`);
  }
  
  return { totalAuth, totalEx, remaining: totalEx - totalAuth };
}

const result = fixedProgressCalculation();
export default result;