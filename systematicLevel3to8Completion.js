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
          text: "提取题目说明文字，只要说明不要过关要求"
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
      content = content.replace(/连续完成.*$/gm, '');
      content = content.replace(/[；。\n]+$/, '');
      return content.trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function systematicLevel3to8Completion() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  console.log('系统性完成Level 3-8真实描述提取...');
  
  let totalUpdated = 0;
  
  // 逐级完成，每次运行一个level的一部分
  const targetLevel = 3; // 先完成Level 3
  const startExercise = 13; // 从第13题开始
  const batchSize = 15; // 每批15题
  
  console.log(`处理 Level ${targetLevel}, 习题 ${startExercise}-${Math.min(startExercise + batchSize - 1, levelCounts[targetLevel])}`);
  
  for (let i = startExercise; i <= Math.min(startExercise + batchSize - 1, levelCounts[targetLevel]); i++) {
    const key = `${targetLevel}-${i}`;
    const currentDesc = descriptions[key];
    
    const needsUpdate = !currentDesc || 
                       currentDesc.includes('如图示摆放球型，完成') ||
                       currentDesc.includes('如图摆放球型，完成') ||
                       currentDesc.length < 20;
    
    if (needsUpdate) {
      const extracted = await extractDescription(targetLevel, i);
      
      if (extracted && extracted.length > 8) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        totalUpdated++;
        
        // 每3题保存一次
        if (totalUpdated % 3 === 0) {
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 400));
    }
  }
  
  // 最终保存
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`批次完成: ${totalUpdated} 题更新`);
  
  // 统计各Level完成度
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && 
          !desc.includes('如图摆放球型，完成') && desc.length > 15) {
        authentic++;
      }
    }
    const percentage = (authentic/levelCounts[level]*100).toFixed(1);
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} 真实描述 (${percentage}%)`);
  });
}

systematicLevel3to8Completion().catch(console.error);