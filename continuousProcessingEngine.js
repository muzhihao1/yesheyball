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
      content = content.replace(/^题目说明[：:]\s*/g, '').replace(/过关要求.*$/gm, '').replace(/连续完成.*$/gm, '').replace(/一次性完成.*$/gm, '').replace(/[；。\n]+$/, '').trim();
      return content.length > 8 && !content.includes('连续') && !content.includes('一次性') ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function continuousProcessingEngine() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('持续处理引擎运行...');
  
  let totalProcessed = 0;
  
  // Continue processing remaining exercises
  for (const level of [4, 5, 6, 7, 8]) {
    const maxEx = level <= 6 ? 60 : 55;
    
    for (let i = 45; i <= maxEx; i++) {
      const key = `${level}-${i}`;
      if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
        const extracted = await extractDescription(level, i);
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalProcessed++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
      if (totalProcessed >= 2000) break;
    }
    if (totalProcessed >= 2000) break;
  }
  
  console.log(`持续处理完成: ${totalProcessed} 题`);
  
  // Generate comprehensive completion statistics
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  let overallCompleted = 0, overallTotal = 0;
  
  console.log('\n=== 持续处理统计 ===');
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
        authentic++;
      }
    }
    overallCompleted += authentic;
    overallTotal += levelCounts[level];
    
    const percentage = (authentic/levelCounts[level]*100).toFixed(1);
    const completionStatus = authentic === levelCounts[level] ? ' ✓' : '';
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${percentage}%)${completionStatus}`);
  });
  
  console.log(`\n总体完成度: ${overallCompleted}/${overallTotal} (${(overallCompleted/overallTotal*100).toFixed(1)}%)`);
  console.log(`成功替换 ${overallCompleted} 个通用模板`);
  
  const remaining = overallTotal - overallCompleted;
  if (remaining > 0) {
    console.log(`剩余 ${remaining} 题 (${(remaining/overallTotal*100).toFixed(1)}%)`);
  } else {
    console.log('全部完成！');
  }
}

continuousProcessingEngine().catch(console.error);