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

async function acceleratedFullCompletion() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('加速完成所有剩余描述...');
  
  let totalUpdated = 0;
  
  // 批量处理队列
  const processQueue = [
    // Level 3 剩余
    { level: 3, range: [31, 50] },
    // Level 4 大批量
    { level: 4, range: [12, 40] },
    // Level 5 大批量
    { level: 5, range: [6, 30] },
    // Level 6 大批量
    { level: 6, range: [5, 25] },
    // Level 7 大批量
    { level: 7, range: [8, 25] },
    // Level 8 大批量
    { level: 8, range: [8, 25] }
  ];
  
  for (const task of processQueue) {
    console.log(`处理 Level ${task.level} (${task.range[0]}-${task.range[1]}题)...`);
    
    for (let i = task.range[0]; i <= task.range[1]; i++) {
      const key = `${task.level}-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || currentDesc.includes('如图示摆放球型，完成') || currentDesc.length < 20) {
        const extracted = await extractDescription(task.level, i);
        
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalUpdated++;
          
          // 频繁保存
          if (totalUpdated % 3 === 0) {
            fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      if (totalUpdated >= 25) break;
    }
    
    if (totalUpdated >= 25) break;
  }
  
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`加速批次完成: ${totalUpdated} 题更新`);
  
  // 完整进度报告
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
  
  console.log(`\n整体完成度: ${completed}/${total} (${(completed/total*100).toFixed(1)}%)`);
}

acceleratedFullCompletion().catch(console.error);