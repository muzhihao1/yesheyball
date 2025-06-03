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

async function comprehensiveRemainingCompletion() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('完整剩余描述提取...');
  
  let totalUpdated = 0;
  
  // Level 4继续
  for (let i = 20; i <= 60; i++) {
    const key = `4-${i}`;
    if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
      const extracted = await extractDescription(4, i);
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        totalUpdated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (totalUpdated >= 20) break;
  }
  
  // Level 5继续
  for (let i = 12; i <= 60; i++) {
    const key = `5-${i}`;
    if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
      const extracted = await extractDescription(5, i);
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        totalUpdated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (totalUpdated >= 40) break;
  }
  
  // Level 6-8全面处理
  for (const level of [6, 7, 8]) {
    const maxEx = level <= 6 ? 60 : 55;
    for (let i = 11; i <= maxEx; i++) {
      const key = `${level}-${i}`;
      if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
        const extracted = await extractDescription(level, i);
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalUpdated++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (totalUpdated >= 80) break;
    }
    if (totalUpdated >= 80) break;
  }
  
  console.log(`全面处理完成: ${totalUpdated} 题更新`);
  
  // 最终统计报告
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  let finalAuthentic = 0, finalTotal = 0;
  
  console.log('\n=== 最终统计报告 ===');
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
        authentic++;
      }
    }
    finalAuthentic += authentic;
    finalTotal += levelCounts[level];
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${(authentic/levelCounts[level]*100).toFixed(1)}%)`);
  });
  
  console.log(`\n【项目最终完成度】: ${finalAuthentic}/${finalTotal} (${(finalAuthentic/finalTotal*100).toFixed(1)}%)`);
  console.log(`成功替换 ${finalAuthentic} 个通用模板为真实描述`);
  
  // 显示剩余未完成的习题
  console.log('\n=== 剩余未完成习题 ===');
  [3,4,5,6,7,8].forEach(level => {
    const remaining = [];
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (!desc || desc.includes('如图示摆放球型，完成') || desc.length < 15) {
        remaining.push(i);
      }
    }
    if (remaining.length > 0) {
      console.log(`Level ${level} 剩余: ${remaining.slice(0, 10).join(', ')}${remaining.length > 10 ? '...' : ''} (共${remaining.length}题)`);
    }
  });
}

comprehensiveRemainingCompletion().catch(console.error);