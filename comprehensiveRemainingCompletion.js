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

async function comprehensiveRemainingCompletion() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('综合剩余完成开始...');
  
  let totalExtracted = 0;
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  // 无限循环直到完成所有练习
  while (true) {
    let cycleExtracted = 0;
    
    // 处理所有未完成的练习，优先级从高到低
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
            console.log(`${key}: ${result}`);
            cycleExtracted++;
            totalExtracted++;
            fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
          }
        }
      }
    }
    
    // 检查完成状态
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
    
    console.log(`本轮提取: ${cycleExtracted} | 总进度: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%)`);
    
    if (totalAuth === totalEx) {
      console.log('全部340个练习描述提取完成');
      break;
    }
  }
  
  console.log(`综合完成总计: ${totalExtracted} 个描述`);
}

comprehensiveRemainingCompletion().catch(console.error);