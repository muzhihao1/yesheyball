import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(level, exerciseNum) {
  const levelFolders = {
    4: '4、炉火纯青', 5: '5、登堂入室', 6: '6、超群绝伦',
    7: '7、登峰造极', 8: '8、出神入化'
  };

  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
  const folderName = levelFolders[level];
  const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);

  if (!fs.existsSync(imagePath)) return null;

  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: "提取题目说明"
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }]
      }],
      max_tokens: 50,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法')) {
      content = content.replace(/^题目说明[：:]\s*/g, '').replace(/过关要求.*$/gm, '').replace(/连续完成.*$/gm, '').replace(/[；。\n]+$/, '').trim();
      return content.length > 8 && !content.includes('连续') ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function finalComprehensiveExtraction() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('最终全面提取模式启动...');
  
  let totalUpdated = 0;
  
  // Process remaining exercises across all levels
  for (const level of [4, 5, 6, 7, 8]) {
    const maxEx = level <= 6 ? 60 : 55;
    console.log(`最终处理 Level ${level} (38-${maxEx})`);
    
    for (let i = 38; i <= maxEx; i++) {
      const key = `${level}-${i}`;
      if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
        const extracted = await extractDescription(level, i);
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalUpdated++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
        await new Promise(resolve => setTimeout(resolve, 1));
      }
      if (totalUpdated >= 500) break;
    }
    if (totalUpdated >= 500) break;
  }
  
  console.log(`最终全面提取完成: ${totalUpdated} 题更新`);
  
  // Generate comprehensive completion report
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  let totalCompleted = 0, totalExercises = 0;
  
  console.log('\n=== 最终全面完成报告 ===');
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
        authentic++;
      }
    }
    totalCompleted += authentic;
    totalExercises += levelCounts[level];
    
    const percentage = (authentic/levelCounts[level]*100).toFixed(1);
    const status = authentic === levelCounts[level] ? ' ✓ 完全完成' : '';
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${percentage}%)${status}`);
  });
  
  console.log(`\n【项目总体完成度】: ${totalCompleted}/${totalExercises} (${(totalCompleted/totalExercises*100).toFixed(1)}%)`);
  console.log(`已成功替换 ${totalCompleted} 个通用模板为真实描述`);
  
  if (totalCompleted < totalExercises) {
    console.log(`剩余 ${totalExercises - totalCompleted} 题待处理 (${((totalExercises - totalCompleted)/totalExercises*100).toFixed(1)}%)`);
  } else {
    console.log('🎉 所有习题描述提取完成！');
  }
  
  // Show sample authentic descriptions
  console.log('\n=== 真实描述样例 ===');
  const samples = [];
  [3,4,5,6,7,8].forEach(level => {
    for (let i = 1; i <= Math.min(3, levelCounts[level]); i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
        samples.push(`${level}-${i}: ${desc.substring(0, 30)}...`);
        if (samples.length >= 5) break;
      }
    }
    if (samples.length >= 5) return;
  });
  
  samples.forEach(sample => console.log(sample));
}

finalComprehensiveExtraction().catch(console.error);