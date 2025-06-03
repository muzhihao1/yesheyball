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

async function comprehensiveExtractionEngine() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('启动全面提取引擎...');
  
  let totalUpdated = 0;
  
  // 超大规模处理
  const megaQueue = [
    { level: 3, start: 37, end: 50, priority: 1 },
    { level: 4, start: 13, end: 50, priority: 2 },
    { level: 5, start: 7, end: 40, priority: 3 },
    { level: 6, start: 6, end: 30, priority: 4 },
    { level: 7, start: 9, end: 30, priority: 5 },
    { level: 8, start: 9, end: 30, priority: 6 }
  ];
  
  // 执行超级批次
  for (const batch of megaQueue) {
    console.log(`超级批次 Level ${batch.level} (${batch.start}-${batch.end})`);
    
    for (let i = batch.start; i <= batch.end; i++) {
      const key = `${batch.level}-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || currentDesc.includes('如图示摆放球型，完成') || currentDesc.length < 20) {
        const extracted = await extractDescription(batch.level, i);
        
        if (extracted) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          totalUpdated++;
          
          // 实时保存
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (totalUpdated >= 30) break;
    }
    
    if (totalUpdated >= 30) break;
  }
  
  console.log(`超级引擎完成: ${totalUpdated} 题`);
  
  // 最终统计
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  let totalCompleted = 0, totalExercises = 0;
  
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
        authentic++;
      }
    }
    totalCompleted += authentic;
    totalExercises += levelCounts[level];
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${(authentic/levelCounts[level]*100).toFixed(1)}%)`);
  });
  
  console.log(`\n【最终进度】: ${totalCompleted}/${totalExercises} (${(totalCompleted/totalExercises*100).toFixed(1)}%)`);
}

comprehensiveExtractionEngine().catch(console.error);