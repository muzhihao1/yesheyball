import fs from 'fs';
import path from 'path';

function recalculateCorrectCounts() {
  console.log('重新计算正确的题目数量 (排除00和01说明文件)...');
  console.log('=========================');
  
  const assessmentsDir = path.join(process.cwd(), 'assessments');
  const levelDirs = fs.readdirSync(assessmentsDir).filter(dir => 
    fs.statSync(path.join(assessmentsDir, dir)).isDirectory()
  ).sort();
  
  const correctCounts = [];
  
  levelDirs.forEach((levelDir, index) => {
    const levelPath = path.join(assessmentsDir, levelDir);
    const files = fs.readdirSync(levelPath).filter(file => file.endsWith('.jpg'));
    
    // 排除00和01说明文件，实际题目从02开始
    const exerciseFiles = files.filter(file => {
      const match = file.match(/_(\d+)\.jpg$/);
      if (match) {
        const fileNum = parseInt(match[1]);
        return fileNum >= 2; // 从02开始才是题目
      }
      return false;
    });
    
    const levelNum = index + 1;
    const actualExerciseCount = exerciseFiles.length;
    
    console.log(`Level ${levelNum} (${levelDir}):`);
    console.log(`  总文件: ${files.length}, 说明文件: 2 (00,01), 题目: ${actualExerciseCount}`);
    
    correctCounts.push({
      level: levelNum,
      count: actualExerciseCount,
      folder: levelDir
    });
  });
  
  console.log('\n正确的题目数量应该是:');
  correctCounts.forEach(info => {
    console.log(`Level ${info.level}: ${info.count}题`);
  });
  
  return correctCounts;
}

const correctCounts = recalculateCorrectCounts();