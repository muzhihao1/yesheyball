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

async function finalPushCompletion() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('最终推进完成...');
  
  let updated = 0;
  
  // Level 4推进
  for (let i = 23; i <= 60; i++) {
    const key = `4-${i}`;
    if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
      const extracted = await extractDescription(4, i);
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    if (updated >= 20) break;
  }
  
  // Level 5推进
  for (let i = 13; i <= 60; i++) {
    const key = `5-${i}`;
    if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
      const extracted = await extractDescription(5, i);
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    if (updated >= 40) break;
  }
  
  // Level 6推进
  for (let i = 12; i <= 60; i++) {
    const key = `6-${i}`;
    if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
      const extracted = await extractDescription(6, i);
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    if (updated >= 60) break;
  }
  
  // Level 7推进
  for (let i = 12; i <= 55; i++) {
    const key = `7-${i}`;
    if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
      const extracted = await extractDescription(7, i);
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    if (updated >= 80) break;
  }
  
  // Level 8推进
  for (let i = 12; i <= 55; i++) {
    const key = `8-${i}`;
    if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
      const extracted = await extractDescription(8, i);
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    if (updated >= 100) break;
  }
  
  console.log(`最终推进: ${updated} 题更新`);
  
  // 最终统计
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  let totalAuth = 0, total = 0;
  
  console.log('\n=== 最终推进报告 ===');
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
  
  console.log(`\n【项目完成度】: ${totalAuth}/${total} (${(totalAuth/total*100).toFixed(1)}%)`);
  console.log(`已替换 ${totalAuth} 个通用模板为真实描述`);
}

finalPushCompletion().catch(console.error);