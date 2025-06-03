import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(level, exerciseNum) {
  try {
    const folderNames = {
      3: '3、小试牛刀', 4: '4、炉火纯青', 5: '5、登堂入室',
      6: '6、超群绝伦', 7: '7、登峰造极', 8: '8、出神入化'
    };
    
    const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
    const folderName = folderNames[level];
    const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);
    
    if (!fs.existsSync(imagePath)) return null;
    
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

async function completeRemaining40() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('完成剩余40个练习...');
  
  let totalExtracted = 0;
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  // 识别所有未完成的练习
  let remaining = [];
  for (const level of [3, 4, 5, 7, 8]) {
    for (let i = 1; i <= levelCounts[level]; i++) {
      const key = `${level}-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || 
          currentDesc.includes('如图示摆放球型，完成') || 
          currentDesc.includes('精进台球技能练习') ||
          currentDesc.includes('高级台球技巧训练') ||
          currentDesc.length < 20) {
        remaining.push({ level, exerciseNum: i, key });
      }
    }
  }
  
  console.log(`发现${remaining.length}个未完成练习`);
  
  // 逐个处理剩余练习
  for (let i = 0; i < remaining.length; i++) {
    const { level, exerciseNum, key } = remaining[i];
    
    console.log(`处理 ${i+1}/${remaining.length}: ${key}`);
    
    const result = await extractDescription(level, exerciseNum);
    if (result) {
      descriptions[key] = result;
      console.log(`✓ ${key}: ${result}`);
      totalExtracted++;
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    } else {
      console.log(`✗ ${key}: 提取失败`);
    }
    
    // 每10个检查一次进度
    if ((i + 1) % 10 === 0) {
      let totalAuth = 0, totalEx = 0;
      [3,4,5,6,7,8].forEach(level => {
        let authentic = 0;
        for (let j = 1; j <= levelCounts[level]; j++) {
          const desc = descriptions[`${level}-${j}`];
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
      });
      
      console.log(`进度检查: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%)`);
    }
  }
  
  // 最终状态检查
  let finalAuth = 0, finalEx = 0;
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
    finalAuth += authentic;
    finalEx += levelCounts[level];
  });
  
  console.log(`\n最终状态: ${finalAuth}/${finalEx} (${(finalAuth/finalEx*100).toFixed(1)}%)`);
  console.log(`本次提取: ${totalExtracted} 个描述`);
  
  if (finalAuth === finalEx) {
    console.log('🎉 全部340个练习完成！');
  } else {
    console.log(`还剩 ${finalEx - finalAuth} 个练习未完成`);
  }
}

completeRemaining40().catch(console.error);