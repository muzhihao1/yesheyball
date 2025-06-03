import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(level, exerciseNum) {
  const levelFolders = {
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

async function completeLevel6to8Final() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  const levelCounts = { 6: 60, 7: 55, 8: 55 };
  
  console.log('完成Level 6-8...');
  
  let totalUpdated = 0;
  
  // Level 6 processing
  console.log('处理 Level 6...');
  for (let i = 1; i <= 15; i++) {
    const key = `6-${i}`;
    const currentDesc = descriptions[key];
    
    if (!currentDesc || currentDesc.includes('如图示摆放球型，完成') || currentDesc.length < 20) {
      const extracted = await extractDescription(6, i);
      
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`6-${i}: ${extracted}`);
        totalUpdated++;
        
        if (totalUpdated % 2 === 0) {
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 350));
    }
    
    if (totalUpdated >= 8) break;
  }
  
  // Level 7 processing
  if (totalUpdated < 12) {
    console.log('处理 Level 7...');
    for (let i = 1; i <= 10; i++) {
      const key = `7-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || currentDesc.includes('如图示摆放球型，完成') || currentDesc.length < 20) {
        const extracted = await extractDescription(7, i);
        
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`7-${i}: ${extracted}`);
          totalUpdated++;
          
          if (totalUpdated % 2 === 0) {
            fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 350));
      }
      
      if (totalUpdated >= 12) break;
    }
  }
  
  // Level 8 processing
  if (totalUpdated < 15) {
    console.log('处理 Level 8...');
    for (let i = 1; i <= 8; i++) {
      const key = `8-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || currentDesc.includes('如图示摆放球型，完成') || currentDesc.length < 20) {
        const extracted = await extractDescription(8, i);
        
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`8-${i}: ${extracted}`);
          totalUpdated++;
          
          if (totalUpdated % 2 === 0) {
            fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 350));
      }
      
      if (totalUpdated >= 15) break;
    }
  }
  
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`批次完成: ${totalUpdated} 题更新`);
  
  // Show progress for all levels
  [6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
        authentic++;
      }
    }
    const percentage = (authentic/levelCounts[level]*100).toFixed(1);
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${percentage}%)`);
  });
}

completeLevel6to8Final().catch(console.error);