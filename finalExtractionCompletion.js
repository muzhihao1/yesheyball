import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(level, exerciseNum) {
  const levelFolders = {
    3: '3、小试牛刀', 4: '4、炉火纯青', 5: '5、登堂入室', 
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
      content = content.replace(/^题目说明[：:]\s*/g, '')
                     .replace(/过关要求.*$/gm, '')
                     .replace(/连续完成.*$/gm, '')
                     .replace(/[；。\n]+$/, '')
                     .trim();
      return content.length > 8 ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function finalExtractionCompletion() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('最终提取完成模式...');
  
  let updated = 0;
  
  // Process all remaining exercises from 24 onwards
  for (const level of [5, 6, 7, 8, 3, 4]) {
    const maxEx = level === 3 ? 50 : (level <= 6 ? 60 : 55);
    
    for (let i = 24; i <= maxEx; i++) {
      const key = `${level}-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || 
          currentDesc.includes('如图示摆放球型，完成') || 
          currentDesc.includes('精进台球技能练习') ||
          currentDesc.includes('高级台球技巧训练') ||
          currentDesc.length < 20) {
        
        const newDesc = await extractDescription(level, i);
        if (newDesc) {
          descriptions[key] = newDesc;
          console.log(`${key}: ${newDesc}`);
          updated++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
    }
  }
  
  console.log(`最终完成: ${updated} 个新描述`);
  
  // Final comprehensive report
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  let totalAuthentic = 0, totalExercises = 0;
  
  console.log('\n=== 最终提取报告 ===');
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && 
          !desc.includes('如图示摆放球型，完成') && 
          !desc.includes('精进台球技能练习') &&
          !desc.includes('高级台球技巧训练') &&
          desc.length > 15) {
        authentic++;
      }
    }
    totalAuthentic += authentic;
    totalExercises += levelCounts[level];
    
    const percentage = (authentic/levelCounts[level]*100).toFixed(1);
    const status = authentic === levelCounts[level] ? ' ✓ 完成' : '';
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${percentage}%)${status}`);
  });
  
  console.log(`\n【项目完成度】: ${totalAuthentic}/${totalExercises} (${(totalAuthentic/totalExercises*100).toFixed(1)}%)`);
  console.log(`已成功替换 ${totalAuthentic} 个通用模板为真实描述`);
  
  const remaining = totalExercises - totalAuthentic;
  if (remaining > 0) {
    console.log(`剩余 ${remaining} 题待处理`);
    
    // Show remaining exercises by level
    console.log('\n=== 剩余题目分布 ===');
    [3,4,5,6,7,8].forEach(level => {
      let remainingList = [];
      for (let i = 1; i <= levelCounts[level]; i++) {
        const desc = descriptions[`${level}-${i}`];
        if (!desc || 
            desc.includes('如图示摆放球型，完成') || 
            desc.includes('精进台球技能练习') ||
            desc.includes('高级台球技巧训练') ||
            desc.length < 20) {
          remainingList.push(i);
        }
      }
      if (remainingList.length > 0) {
        console.log(`Level ${level}: ${remainingList.slice(0, 10).join(',')}${remainingList.length > 10 ? '...' : ''} (${remainingList.length}题)`);
      }
    });
  } else {
    console.log('🎉 所有练习描述提取完成！');
  }
}

finalExtractionCompletion().catch(console.error);