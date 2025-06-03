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

async function completeAllLevels() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('完成所有Level...');
  
  let processed = 0;
  
  // Complete Level 5 remaining (from 51)
  for (let i = 51; i <= 60; i++) {
    const key = `5-${i}`;
    const currentDesc = descriptions[key];
    
    if (!currentDesc || 
        currentDesc.includes('如图示摆放球型，完成') || 
        currentDesc.includes('精进台球技能练习') ||
        currentDesc.length < 20) {
      
      const newDesc = await extractDescription(5, i);
      if (newDesc) {
        descriptions[key] = newDesc;
        console.log(`${key}: ${newDesc}`);
        processed++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
    }
  }
  
  // Complete Level 6 entirely
  for (let i = 5; i <= 60; i++) {
    const key = `6-${i}`;
    const currentDesc = descriptions[key];
    
    if (!currentDesc || 
        currentDesc.includes('如图示摆放球型，完成') || 
        currentDesc.includes('精进台球技能练习') ||
        currentDesc.length < 20) {
      
      const newDesc = await extractDescription(6, i);
      if (newDesc) {
        descriptions[key] = newDesc;
        console.log(`${key}: ${newDesc}`);
        processed++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
    }
  }
  
  // Complete Level 7 entirely
  for (let i = 4; i <= 55; i++) {
    const key = `7-${i}`;
    const currentDesc = descriptions[key];
    
    if (!currentDesc || 
        currentDesc.includes('如图示摆放球型，完成') || 
        currentDesc.includes('精进台球技能练习') ||
        currentDesc.length < 20) {
      
      const newDesc = await extractDescription(7, i);
      if (newDesc) {
        descriptions[key] = newDesc;
        console.log(`${key}: ${newDesc}`);
        processed++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
    }
  }
  
  // Complete Level 8 entirely (skip existing ones)
  for (let i = 8; i <= 55; i++) {
    const key = `8-${i}`;
    const currentDesc = descriptions[key];
    
    if (!currentDesc || 
        currentDesc.includes('如图示摆放球型，完成') || 
        currentDesc.includes('精进台球技能练习') ||
        currentDesc.length < 20) {
      
      const newDesc = await extractDescription(8, i);
      if (newDesc) {
        descriptions[key] = newDesc;
        console.log(`${key}: ${newDesc}`);
        processed++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
    }
  }
  
  // Complete remaining Level 3 and 4
  for (const level of [3, 4]) {
    const maxEx = level === 3 ? 50 : 60;
    for (let i = 42; i <= maxEx; i++) {
      const key = `${level}-${i}`;
      const currentDesc = descriptions[key];
      
      if (!currentDesc || 
          currentDesc.includes('如图示摆放球型，完成') || 
          currentDesc.includes('高级台球技巧训练') ||
          currentDesc.length < 20) {
        
        const newDesc = await extractDescription(level, i);
        if (newDesc) {
          descriptions[key] = newDesc;
          console.log(`${key}: ${newDesc}`);
          processed++;
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
    }
  }
  
  console.log(`所有Level完成: ${processed} 个描述`);
}

completeAllLevels().catch(console.error);