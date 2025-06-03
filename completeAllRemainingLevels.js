import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractAuthenticDescription(level, exerciseNum) {
  const levelFolders = {
    1: '1、初窥门径', 2: '2、小有所成', 3: '3、渐入佳境', 4: '4、炉火纯青',
    5: '5、登堂入室', 6: '6、超群绝伦', 7: '7、登峰造极', 8: '8、出神入化'
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
          text: "提取题目说明文字，只要说明内容，不要过关要求"
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }]
      }],
      max_tokens: 60,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法')) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/连续完成.*$/gm, '');
      content = content.replace(/[；。\n\r\t]+$/, '');
      return content.trim();
    }
    return null;
  } catch (error) {
    console.error(`提取错误 ${level}-${exerciseNum}:`, error.message);
    return null;
  }
}

async function processAllRemainingLevels() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  const levelCounts = { 1: 35, 2: 40, 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  console.log('开始系统性验证所有剩余习题...');
  console.log('=========================');
  
  let totalUpdated = 0;
  let processed = 0;
  
  // 处理所有Level (限制批量大小避免超时)
  for (const level of [3, 4, 5, 6, 7, 8]) {
    console.log(`\n处理 Level ${level}...`);
    let levelUpdated = 0;
    
    // 每个Level只处理前10题，避免超时
    for (let i = 1; i <= Math.min(10, levelCounts[level]); i++) {
      const key = `${level}-${i}`;
      const currentDesc = descriptions[key];
      
      const needsUpdate = !currentDesc || 
                         currentDesc.includes('如图示摆放球型，完成') ||
                         currentDesc.includes('如图摆放球型，完成') ||
                         currentDesc.length < 20;
      
      if (needsUpdate) {
        console.log(`提取 ${key}...`);
        const extracted = await extractAuthenticDescription(level, i);
        
        if (extracted && extracted.length > 8) {
          descriptions[key] = extracted;
          console.log(`${key}: ${extracted}`);
          levelUpdated++;
          totalUpdated++;
          
          // 每5题保存一次
          if (levelUpdated % 5 === 0) {
            fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
          }
        }
        
        processed++;
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      
      // 限制处理时间
      if (processed >= 25) break;
    }
    
    if (processed >= 25) break;
  }
  
  // 最终保存
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`\n批次完成: ${totalUpdated} 题更新，处理了 ${processed} 题`);
  
  // 统计各Level进度
  console.log('\n各Level真实描述进度:');
  [1,2,3,4,5,6,7,8].forEach(level => {
    let authentic = 0;
    for (let i = 1; i <= levelCounts[level]; i++) {
      const desc = descriptions[`${level}-${i}`];
      if (desc && !desc.includes('如图示摆放球型，完成') && 
          !desc.includes('如图摆放球型，完成') && desc.length > 15) {
        authentic++;
      }
    }
    console.log(`Level ${level}: ${authentic}/${levelCounts[level]} 真实描述 (${(authentic/levelCounts[level]*100).toFixed(1)}%)`);
  });
}

processAllRemainingLevels().catch(console.error);