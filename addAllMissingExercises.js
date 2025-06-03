import fs from 'fs';

function addAllMissingExercises() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  const missingExercises = [
    // Level 3: 51, 52
    { level: 3, exercises: [51, 52], template: "如图摆放球型，完成中级台球技能训练" },
    // Level 4: 51-62
    { level: 4, exercises: [51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62], template: "如图摆放球型，完成高级台球技巧训练" },
    // Level 5: 51-62
    { level: 5, exercises: [51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62], template: "如图摆放球型，完成精进台球技能练习" },
    // Level 6: 61, 62
    { level: 6, exercises: [61, 62], template: "如图摆放球型，完成专业台球技艺训练" },
    // Level 7: 57
    { level: 7, exercises: [57], template: "如图摆放球型，完成顶级台球技巧训练" },
    // Level 8: 51-57
    { level: 8, exercises: [51, 52, 53, 54, 55, 56, 57], template: "如图摆放球型，完成顶级台球技艺训练" }
  ];
  
  let totalAdded = 0;
  
  console.log('添加所有缺失的练习题...');
  console.log('=========================');
  
  missingExercises.forEach(levelData => {
    console.log(`\nLevel ${levelData.level}: 添加 ${levelData.exercises.length} 题`);
    
    levelData.exercises.forEach(exerciseNum => {
      const key = `${levelData.level}-${exerciseNum}`;
      descriptions[key] = levelData.template;
      console.log(`${key}: ${levelData.template}`);
      totalAdded++;
    });
  });
  
  // 保存更新的文件
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`\n总共添加: ${totalAdded} 题`);
  console.log('\n最终统计:');
  
  // 统计最终数量
  const finalCounts = [
    { level: 1, expected: 37 },
    { level: 2, expected: 42 },
    { level: 3, expected: 52 },
    { level: 4, expected: 62 },
    { level: 5, expected: 62 },
    { level: 6, expected: 62 },
    { level: 7, expected: 57 },
    { level: 8, expected: 57 }
  ];
  
  finalCounts.forEach(info => {
    let count = 0;
    for (let i = 1; i <= info.expected; i++) {
      if (descriptions[`${info.level}-${i}`]) count++;
    }
    console.log(`Level ${info.level}: ${count}/${info.expected}题 ${count === info.expected ? '✓' : '✗'}`);
  });
}

addAllMissingExercises();