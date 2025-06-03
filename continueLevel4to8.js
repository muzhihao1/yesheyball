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
      content = content.replace(/^题目说明[：:]\s*/g, '').replace(/过关要求.*$/gm, '').replace(/[；。\n]+$/, '').trim();
      return content.length > 8 ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function continueLevel4to8() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('继续Level 4-8提取...');
  
  let totalUpdated = 0;
  let processed = 0;
  
  // 重点处理Level 4-8
  for (const level of [4, 5, 6, 7, 8]) {
    console.log(`处理 Level ${level}...`);
    
    for (let i = 1; i <= 5; i++) {
      const key = `${level}-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || currentDesc.includes('如图示摆放球型，完成') || currentDesc.length < 20) {
        const extracted = await extractDescription(level, i);
        
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalUpdated++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
        
        processed++;
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (processed >= 15) break;
      }
    }
    
    if (processed >= 15) break;
  }
  
  console.log(`完成: ${totalUpdated} 题更新`);
  
  const levelCounts = { 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  [4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
        authentic++;
      }
    }
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${(authentic/levelCounts[level]*100).toFixed(1)}%)`);
  });
}

continueLevel4to8().catch(console.error);