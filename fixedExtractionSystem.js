import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(level, exerciseNum) {
  try {
    const folderNames = {
      3: '3、渐入佳境', 4: '4、炉火纯青', 5: '5、登堂入室',
      6: '6、超群绝伦', 7: '7、登峰造极', 8: '8、出神入化'
    };
    
    // 修正文件索引 - 文件从 _00.jpg 开始，对应练习1
    const fileIndex = exerciseNum.toString().padStart(2, '0');
    const folderName = folderNames[level];
    const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);
    
    if (!fs.existsSync(imagePath)) {
      console.log(`文件不存在: ${imagePath}`);
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
    console.log(`提取错误 ${level}-${exerciseNum}: ${error.message}`);
    return null;
  }
}

async function fixedExtractionSystem() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('修正版提取系统启动...');
  
  let totalExtracted = 0;
  const levelCounts = { 3: 50, 4: 60, 5: 60, 6: 60, 7: 55, 8: 55 };
  
  // 验证文件数量
  console.log('验证文件结构...');
  const folderNames = {
    3: '3、渐入佳境', 4: '4、炉火纯青', 5: '5、登堂入室',
    6: '6、超群绝伦', 7: '7、登峰造极', 8: '8、出神入化'
  };
  
  for (const level of [3, 4, 5, 7, 8]) {
    const folderPath = path.join(process.cwd(), 'assessments', folderNames[level]);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg'));
    console.log(`Level ${level}: ${files.length}个文件`);
  }
  
  // 开始提取
  for (let round = 1; round <= 100; round++) {
    let roundExtracted = 0;
    
    console.log(`第${round}轮修正提取`);
    
    for (const level of [8, 3, 4, 5, 7]) {
      for (let i = 0; i < levelCounts[level]; i++) { // 从0开始，对应 _00.jpg
        const exerciseNum = i + 1; // 练习编号从1开始
        const key = `${level}-${exerciseNum}`;
        const currentDesc = descriptions[key];
        
        if (!currentDesc || 
            currentDesc.includes('如图示摆放球型，完成') || 
            currentDesc.includes('精进台球技能练习') ||
            currentDesc.includes('高级台球技巧训练') ||
            currentDesc.length < 20) {
          
          const result = await extractDescription(level, i); // 传入文件索引i
          if (result) {
            descriptions[key] = result;
            console.log(`[${round}] ${key}: ${result}`);
            totalExtracted++;
            roundExtracted++;
            fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
          }
        }
      }
    }
    
    // 状态检查
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
    
    console.log(`第${round}轮: 提取${roundExtracted}个 | 总进度: ${totalAuth}/${totalEx} (${(totalAuth/totalEx*100).toFixed(1)}%)`);
    
    if (totalAuth === totalEx) {
      console.log(`全部340个练习完成！第${round}轮，总提取${totalExtracted}个`);
      break;
    }
    
    if (roundExtracted === 0 && round > 5) {
      console.log('连续无新提取，结束');
      break;
    }
  }
  
  console.log(`修正版提取完成: ${totalExtracted}个描述`);
}

fixedExtractionSystem().catch(console.error);