import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractRequirement(imagePath) {
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
                     .replace(/不超过.*$/gm, '')
                     .replace(/[；。\n]+$/, '')
                     .trim();
      return content.length > 8 ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function completeLevel8Accelerated() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('加速完成Level 8...');
  
  let extracted = 0;
  const folderName = '8、出神入化';
  
  // Process all Level 8 exercises
  for (let i = 1; i <= 55; i++) {
    const key = `8-${i}`;
    const currentDesc = descriptions[key];
    
    if (!currentDesc || 
        currentDesc.includes('如图示摆放球型，完成') || 
        currentDesc.includes('精进台球技能练习') ||
        currentDesc.length < 20) {
      
      const fileIndex = (i + 1).toString().padStart(2, '0');
      const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);
      
      if (fs.existsSync(imagePath)) {
        const result = await extractRequirement(imagePath);
        if (result) {
          descriptions[key] = result;
          console.log(`✓ ${key}: ${result}`);
          extracted++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
    }
  }
  
  // Complete remaining from other levels
  const levelFolders = {
    3: '3、小试牛刀', 4: '4、炉火纯青', 5: '5、登堂入室', 
    7: '7、登峰造极'
  };
  
  const levelCounts = { 3: 50, 4: 60, 5: 60, 7: 55 };
  
  for (const level of [7, 5, 4, 3]) {
    const maxEx = levelCounts[level];
    
    for (let i = 1; i <= maxEx; i++) {
      const key = `${level}-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || 
          currentDesc.includes('如图示摆放球型，完成') || 
          currentDesc.includes('精进台球技能练习') ||
          currentDesc.includes('高级台球技巧训练') ||
          currentDesc.length < 20) {
        
        const fileIndex = (i + 1).toString().padStart(2, '0');
        const folderName = levelFolders[level];
        const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);
        
        if (fs.existsSync(imagePath)) {
          const result = await extractRequirement(imagePath);
          if (result) {
            descriptions[key] = result;
            console.log(`✓ ${key}: ${result}`);
            extracted++;
            fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
          }
        }
      }
    }
  }
  
  console.log(`\n加速提取: ${extracted} 个描述`);
  
  // Final comprehensive status
  const allLevelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  let totalAuth = 0, totalEx = 0;
  
  console.log('\n=== 最终状态 ===');
  [3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= allLevelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && 
          !desc.includes('如图示摆放球型，完成') && 
          !desc.includes('精进台球技能练习') &&
          !desc.includes('高级台球技巧训练') &&
          desc.length > 15) {
        authentic++;
      }
    }
    totalAuth += authentic;
    totalEx += allLevelCounts[level];
    
    const pct = (authentic/allLevelCounts[level]*100).toFixed(1);
    const status = authentic === allLevelCounts[level] ? ' ✅ 完成' : '';
    console.log(`Level ${level}: ${authentic}/${allLevelCounts[level]} (${pct}%)${status}`);
  });
  
  console.log(`\n总体状态: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%)`);
  console.log(`已完成提取 ${totalAuth} 个真实描述`);
  
  if (totalAuth === totalEx) {
    console.log('\n🎉 全部340个练习描述提取完成！');
  } else {
    console.log(`还有 ${totalEx - totalAuth} 个练习需要完成`);
  }
}

completeLevel8Accelerated().catch(console.error);