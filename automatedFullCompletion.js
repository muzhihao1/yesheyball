import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(level, exerciseNum) {
  try {
    const levelFolders = {
      3: '3、小试牛刀', 4: '4、炉火纯青', 5: '5、登堂入室', 
      6: '6、超群绝伦', 7: '7、登峰造极', 8: '8、出神入化'
    };
    
    const folderName = levelFolders[level];
    const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
    const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);

    if (!fs.existsSync(imagePath)) {
      return null;
    }

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

async function automatedFullCompletion() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('自动化全面完成...');
  
  let extracted = 0;
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  // Process in high-priority order
  const processingOrder = [
    { level: 8, range: [1, 55] },
    { level: 7, range: [54, 55] },
    { level: 5, range: [57, 60] },
    { level: 4, range: [51, 60] },
    { level: 3, range: [42, 50] }
  ];
  
  for (const { level, range } of processingOrder) {
    console.log(`处理 Level ${level} (${range[0]}-${range[1]})...`);
    
    for (let i = range[0]; i <= range[1]; i++) {
      const key = `${level}-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || 
          currentDesc.includes('如图示摆放球型，完成') || 
          currentDesc.includes('精进台球技能练习') ||
          currentDesc.includes('高级台球技巧训练') ||
          currentDesc.length < 20) {
        
        const result = await extractDescription(level, i);
        if (result) {
          descriptions[key] = result;
          console.log(`✓ ${key}: ${result}`);
          extracted++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
    }
  }
  
  // Complete all remaining exercises from start
  for (const level of [8, 7, 5, 4, 3]) {
    for (let i = 1; i <= levelCounts[level]; i++) {
      const key = `${level}-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || 
          currentDesc.includes('如图示摆放球型，完成') || 
          currentDesc.includes('精进台球技能练习') ||
          currentDesc.includes('高级台球技巧训练') ||
          currentDesc.length < 20) {
        
        const result = await extractDescription(level, i);
        if (result) {
          descriptions[key] = result;
          console.log(`✓ ${key}: ${result}`);
          extracted++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
    }
  }
  
  console.log(`自动化提取: ${extracted} 个描述`);
  
  // Final verification
  let totalAuth = 0, totalEx = 0;
  
  console.log('\n=== 完成验证 ===');
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
    totalAuth += authentic;
    totalEx += levelCounts[level];
    
    const pct = (authentic/levelCounts[level]*100).toFixed(1);
    const status = authentic === levelCounts[level] ? ' ✅' : '';
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${pct}%)${status}`);
  });
  
  console.log(`\n最终: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%)`);
  
  if (totalAuth === totalEx) {
    console.log('🎉 全部完成！');
  } else {
    console.log(`剩余: ${totalEx - totalAuth}`);
  }
}

automatedFullCompletion().catch(console.error);