import fs from 'fs';
import path from 'path';

function checkMissingExercises() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('检查缺失的题目...');
  console.log('=========================');
  
  const levelInfo = [
    { level: 1, folder: '1、初窥门径', expected: 35, actual: 37 },
    { level: 2, folder: '2、小有所成', expected: 40, actual: 42 },
    { level: 3, folder: '3、渐入佳境', expected: 50, actual: 52 },
    { level: 4, folder: '4、炉火纯青', expected: 50, actual: 62 },
    { level: 5, folder: '5、登堂入室', expected: 50, actual: 62 },
    { level: 6, folder: '6、超群绝伦', expected: 60, actual: 62 },
    { level: 7, folder: '7、登峰造极', expected: 56, actual: 57 },
    { level: 8, folder: '8、出神入化', expected: 50, actual: 57 }
  ];
  
  levelInfo.forEach(info => {
    console.log(`\nLevel ${info.level} (${info.folder}):`);
    console.log(`描述文件: ${info.expected}题, 图片文件: ${info.actual}题`);
    
    if (info.actual > info.expected) {
      console.log(`多出 ${info.actual - info.expected} 题图片`);
      
      // 检查哪些题目缺少描述
      const levelPath = path.join(process.cwd(), 'assessments', info.folder);
      const files = fs.readdirSync(levelPath).filter(file => file.endsWith('.jpg')).sort();
      
      const missingDescriptions = [];
      files.forEach((file, index) => {
        const exerciseNum = index + 1;
        const key = `${info.level}-${exerciseNum}`;
        if (!descriptions[key] && exerciseNum <= info.actual) {
          missingDescriptions.push(exerciseNum);
        }
      });
      
      if (missingDescriptions.length > 0) {
        console.log(`缺少描述的题目: ${missingDescriptions.join(', ')}`);
      }
    } else if (info.actual < info.expected) {
      console.log(`缺少 ${info.expected - info.actual} 题图片`);
    } else {
      console.log('数量匹配 ✓');
    }
  });
}

checkMissingExercises();