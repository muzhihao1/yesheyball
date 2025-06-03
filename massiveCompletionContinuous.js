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

async function massiveCompletionContinuous() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('大规模持续完成所有Level...');
  
  let totalUpdated = 0;
  
  // 优先处理Level 3剩余
  for (let i = 34; i <= 50; i++) {
    const key = `3-${i}`;
    const currentDesc = descriptions[key];
    
    if (!currentDesc || currentDesc.includes('如图示摆放球型，完成') || currentDesc.length < 20) {
      const extracted = await extractDescription(3, i);
      
      if (extracted) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        totalUpdated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    if (totalUpdated >= 8) break;
  }
  
  // Level 4大批量
  if (totalUpdated < 15) {
    for (let i = 12; i <= 45; i++) {
      const key = `4-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || currentDesc.includes('如图示摆放球型，完成') || currentDesc.length < 20) {
        const extracted = await extractDescription(4, i);
        
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalUpdated++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
        
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      if (totalUpdated >= 15) break;
    }
  }
  
  // Level 5大批量
  if (totalUpdated < 20) {
    for (let i = 6; i <= 35; i++) {
      const key = `5-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || currentDesc.includes('如图示摆放球型，完成') || currentDesc.length < 20) {
        const extracted = await extractDescription(5, i);
        
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalUpdated++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
        
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      if (totalUpdated >= 20) break;
    }
  }
  
  console.log(`大规模批次: ${totalUpdated} 题更新`);
  
  // 统计进度
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  let completed = 0, total = 0;
  
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
        authentic++;
      }
    }
    completed += authentic;
    total += levelCounts[level];
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${(authentic/levelCounts[level]*100).toFixed(1)}%)`);
  });
  
  console.log(`\n总完成度: ${completed}/${total} (${(completed/total*100).toFixed(1)}%)`);
}

massiveCompletionContinuous().catch(console.error);