import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractRequirement(imagePath) {
  try {
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
    if (content && !content.includes('无法') && !content.includes("I'm sorry") && !content.includes("I can't")) {
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

async function acceleratedVerify() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('加速验证系统启动...');
  
  let totalExtracted = 0;
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  const folderNames = {
    3: '3、渐入佳境', 4: '4、炉火纯青', 5: '5、登堂入室',
    6: '6、超群绝伦', 7: '7、登峰造极', 8: '8、出神入化'
  };
  
  // 连续高速处理剩余练习
  for (let round = 1; round <= 20000; round++) {
    let roundExtracted = 0;
    
    // 快速处理模式
    const processingModes = [
      [3, 4, 5, 7, 8], [8, 7, 5, 4, 3], [4, 8, 3, 7, 5], 
      [5, 3, 8, 4, 7], [7, 5, 4, 8, 3], [8, 4, 7, 3, 5]
    ];
    
    const mode = processingModes[round % processingModes.length];
    
    for (const level of mode) {
      for (let i = 1; i <= levelCounts[level]; i++) {
        const key = `${level}-${i}`;
        const currentDesc = descriptions[key];
        
        if (!currentDesc || 
            currentDesc.includes('如图示摆放球型，完成') || 
            currentDesc.includes('精进台球技能练习') ||
            currentDesc.includes('高级台球技巧训练') ||
            currentDesc.length < 20) {
          
          const fileIndex = (i + 1).toString().padStart(2, '0');
          const folderName = folderNames[level];
          const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);
          
          const result = await extractRequirement(imagePath);
          if (result) {
            descriptions[key] = result;
            console.log(`加速验证${round} ${key}: ${result}`);
            totalExtracted++;
            roundExtracted++;
            fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
          }
        }
      }
    }
    
    // 实时状态检查
    let totalAuth = 0, totalEx = 0;
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
    });
    
    if (round % 2 === 0) {
      console.log(`加速验证${round}: +${roundExtracted} | 总体: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%)`);
    }
    
    if (totalAuth === totalEx) {
      console.log(`全部340个练习完成！加速验证第${round}轮完成`);
      
      console.log('最终结果验证:');
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
        const pct = (authentic/levelCounts[level]*100).toFixed(1);
        console.log(`Level ${level}: ${authentic}/${levelCounts[level]} (${pct}%)`);
      });
      
      return;
    }
    
    if (roundExtracted === 0 && round > 3000) {
      console.log('连续3000轮无进展');
      break;
    }
  }
  
  console.log(`加速验证系统结束: 总共提取${totalExtracted}个新描述`);
}

acceleratedVerify().catch(console.error);