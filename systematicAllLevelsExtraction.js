import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(level, exerciseNum) {
  const levelFolders = {
    1: '1、初窥门径',
    2: '2、小有所成', 
    3: '3、渐入佳境',
    4: '4、炉火纯青',
    5: '5、登堂入室',
    6: '6、超群绝伦',
    7: '7、登峰造极',
    8: '8、出神入化'
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
          text: "提取题目说明文字"
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
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/[；。\n]+$/, '');
      return content.trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function processLevelBatch(level, startExercise, batchSize) {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  const levelCounts = {
    1: 35, 2: 40, 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55
  };
  
  const maxExercises = levelCounts[level];
  let updated = 0;
  
  console.log(`处理Level ${level}, 练习 ${startExercise}-${Math.min(startExercise + batchSize - 1, maxExercises)}`);
  
  for (let i = startExercise; i <= Math.min(startExercise + batchSize - 1, maxExercises); i++) {
    const key = `${level}-${i}`;
    const currentDesc = descriptions[key];
    
    const shouldUpdate = !currentDesc || 
                        currentDesc.includes('如图示摆放球型，完成') ||
                        currentDesc.includes('如图摆放球型，完成') ||
                        currentDesc.length < 20;
    
    if (shouldUpdate) {
      const extracted = await extractDescription(level, i);
      
      if (extracted && extracted.length > 8) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      
      await new Promise(resolve => setTimeout(resolve, 400));
    }
  }
  
  console.log(`Level ${level} 批次完成: ${updated} 题更新`);
  return updated;
}

async function systematicAllLevelsExtraction() {
  const processingQueue = [
    // Continue Level 3
    { level: 3, start: 8, batch: 10 },
    { level: 3, start: 18, batch: 10 },
    { level: 3, start: 28, batch: 10 },
    { level: 3, start: 38, batch: 12 },
    
    // Level 4
    { level: 4, start: 1, batch: 15 },
    { level: 4, start: 16, batch: 15 },
    
    // Level 5  
    { level: 5, start: 1, batch: 15 },
    { level: 5, start: 16, batch: 15 },
    
    // Level 6
    { level: 6, start: 1, batch: 15 },
    { level: 6, start: 16, batch: 15 },
    
    // Level 7
    { level: 7, start: 1, batch: 15 },
    { level: 7, start: 16, batch: 15 },
    
    // Level 8
    { level: 8, start: 1, batch: 15 },
    { level: 8, start: 16, batch: 15 }
  ];
  
  let totalUpdated = 0;
  
  // Process first item in queue
  const task = processingQueue[0];
  totalUpdated += await processLevelBatch(task.level, task.start, task.batch);
  
  console.log(`系统提取完成: 总计 ${totalUpdated} 题更新`);
  
  // Show overall progress
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  [1,2,3,4,5,6,7,8].forEach(level => {
    const levelCounts = { 1: 35, 2: 40, 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
    let authentic = 0;
    
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && !desc.includes('如图摆放球型，完成') && desc.length > 15) {
        authentic++;
      }
    }
    
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} 真实描述 (${(authentic/levelCounts[level]*100).toFixed(1)}%)`);
  });
}

systematicAllLevelsExtraction().catch(console.error);