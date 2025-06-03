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

async function finalExhaustiveCompletion() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('穷尽式最终完成模式...');
  
  let updated = 0;
  
  // Level 3完成
  for (let i = 43; i <= 50; i++) {
    const key = `3-${i}`;
    if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
      const extracted = await extractDescription(3, i);
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (updated >= 3) break;
  }
  
  // Level 4大量处理
  for (let i = 14; i <= 60; i++) {
    const key = `4-${i}`;
    if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
      const extracted = await extractDescription(4, i);
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (updated >= 8) break;
  }
  
  // Level 5大量处理
  for (let i = 8; i <= 60; i++) {
    const key = `5-${i}`;
    if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
      const extracted = await extractDescription(5, i);
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (updated >= 13) break;
  }
  
  // Level 6处理
  for (let i = 7; i <= 60; i++) {
    const key = `6-${i}`;
    if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
      const extracted = await extractDescription(6, i);
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (updated >= 18) break;
  }
  
  // Level 7处理
  for (let i = 10; i <= 55; i++) {
    const key = `7-${i}`;
    if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
      const extracted = await extractDescription(7, i);
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (updated >= 23) break;
  }
  
  // Level 8处理
  for (let i = 10; i <= 55; i++) {
    const key = `8-${i}`;
    if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
      const extracted = await extractDescription(8, i);
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (updated >= 28) break;
  }
  
  console.log(`穷尽式完成: ${updated} 题`);
  
  // 最终统计
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  let totalAuth = 0, total = 0;
  
  console.log('\n=== 穷尽式统计 ===');
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
        authentic++;
      }
    }
    totalAuth += authentic;
    total += levelCounts[level];
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${(authentic/levelCounts[level]*100).toFixed(1)}%)`);
  });
  
  console.log(`\n【项目总完成度】: ${totalAuth}/${total} (${(totalAuth/total*100).toFixed(1)}%)`);
  console.log(`成功替换 ${totalAuth} 个通用模板为真实描述`);
}

finalExhaustiveCompletion().catch(console.error);