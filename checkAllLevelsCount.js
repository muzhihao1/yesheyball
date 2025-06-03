import fs from 'fs';
import path from 'path';

function checkAllLevelsCount() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('各Level习题数量统计:');
  console.log('=========================');
  
  // 检查各个level的文件夹
  const assessmentsDir = path.join(process.cwd(), 'assessments');
  const levelDirs = fs.readdirSync(assessmentsDir).filter(dir => 
    fs.statSync(path.join(assessmentsDir, dir)).isDirectory()
  ).sort();
  
  console.log('文件夹中的实际题目数量:');
  levelDirs.forEach((levelDir, index) => {
    const levelPath = path.join(assessmentsDir, levelDir);
    const files = fs.readdirSync(levelPath).filter(file => file.endsWith('.jpg'));
    console.log(`Level ${index + 1} (${levelDir}): ${files.length}题`);
  });
  
  console.log('\n描述文件中的数量:');
  for (let level = 1; level <= 8; level++) {
    let count = 0;
    for (let i = 1; i <= 100; i++) {
      const key = `${level}-${i}`;
      if (descriptions[key]) {
        count++;
      } else {
        break;
      }
    }
    console.log(`Level ${level}: ${count}题`);
  }
  
  console.log('\n检查可能的错误分配:');
  // 检查是否有跨level的描述
  Object.keys(descriptions).forEach(key => {
    const match = key.match(/^(\d+)-(\d+)$/);
    if (match) {
      const level = parseInt(match[1]);
      const exercise = parseInt(match[2]);
      
      // 检查异常的题目编号
      if (level <= 8 && exercise > 50) {
        console.log(`可能异常: ${key} - 题目编号过大`);
      }
    }
  });
}

checkAllLevelsCount();