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

async function ultimateSystematicCompletion() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('终极系统性完成...');
  
  let updated = 0;
  
  // Ultra-fast processing for massive completion
  for (const level of [4, 5, 6, 7, 8]) {
    const maxEx = level <= 6 ? 60 : 55;
    console.log(`终极处理 Level ${level}`);
    
    for (let i = 33; i <= maxEx; i++) {
      const key = `${level}-${i}`;
      if (!descriptions[key] || descriptions[key].includes('如图示摆放球型，完成') || descriptions[key].length < 20) {
        const extracted = await extractDescription(level, i);
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          updated++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      if (updated >= 200) break;
    }
    if (updated >= 200) break;
  }
  
  console.log(`终极完成: ${updated} 题更新`);
  
  // Ultimate final statistics
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  let finalAuth = 0, finalTotal = 0;
  
  console.log('\n=== 终极完成统计 ===');
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
        authentic++;
      }
    }
    finalAuth += authentic;
    finalTotal += levelCounts[level];
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${(authentic/levelCounts[level]*100).toFixed(1)}%)`);
  });
  
  console.log(`\n【最终项目完成度】: ${finalAuth}/${finalTotal} (${(finalAuth/finalTotal*100).toFixed(1)}%)`);
  console.log(`已成功替换 ${finalAuth} 个通用模板为真实描述`);
  console.log(`剩余 ${finalTotal - finalAuth} 题 (${((finalTotal - finalAuth)/finalTotal*100).toFixed(1)}%)`);
  
  // Show completion status by level
  console.log('\n=== 各Level完成状态 ===');
  [3,4,5,6,7,8].forEach(level => {
    let completed = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
        completed++;
      }
    }
    const status = completed === levelCounts[level] ? '✓ 完成' : `进行中 (${completed}/${levelCounts[level]})`;
    console.log(`Level ${level}: ${status}`);
  });
}

ultimateSystematicCompletion().catch(console.error);