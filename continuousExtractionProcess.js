import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(level, exerciseNum) {
  const levelFolders = {
    3: '3、渐入佳境', 4: '4、炉火纯青', 5: '5、登堂入室',
    6: '6、超群绝伦', 7: '7、登峰造极', 8: '8、出神入化'
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

async function continuousExtractionProcess() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('持续提取处理...');
  
  let totalUpdated = 0;
  
  // 完成Level 3最后几题
  for (let i = 45; i <= 50; i++) {
    const key = `3-${i}`;
    if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
      const extracted = await extractDescription(3, i);
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        totalUpdated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Level 4大规模处理
  for (let i = 15; i <= 45; i++) {
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
  
  // Level 5大规模处理
  for (let i = 9; i <= 40; i++) {
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
    if (totalUpdated >= 35) break;
  }
  
  // Level 6, 7, 8 处理
  for (const level of [6, 7, 8]) {
    const maxEx = level <= 6 ? 60 : 55;
    for (let i = 8; i <= Math.min(30, maxEx); i++) {
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
      if (totalUpdated >= 50) break;
    }
    if (totalUpdated >= 50) break;
  }
  
  console.log(`持续处理完成: ${totalUpdated} 题更新`);
  
  // 统计报告
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  let totalAuthentic = 0, totalExercises = 0;
  
  console.log('\n=== 进度报告 ===');
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
        authentic++;
      }
    }
    totalAuthentic += authentic;
    totalExercises += levelCounts[level];
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${(authentic/levelCounts[level]*100).toFixed(1)}%)`);
  });
  
  console.log(`\n总体完成度: ${totalAuthentic}/${totalExercises} (${(totalAuthentic/totalExercises*100).toFixed(1)}%)`);
}

continuousExtractionProcess().catch(console.error);