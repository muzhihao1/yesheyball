import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(exerciseNum) {
  const folderName = '3、渐入佳境';
  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
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
          text: "提取题目说明文字"
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
      content = content.replace(/[；。\n]+$/, '');
      return content.trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function completeLevel3() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('完成Level 3所有剩余习题...');
  
  let updated = 0;
  
  // 处理Level 3 所有50题
  for (let i = 9; i <= 50; i++) {
    const key = `3-${i}`;
    const currentDesc = descriptions[key];
    
    const needsUpdate = !currentDesc || 
                       currentDesc.includes('如图示摆放球型，完成') ||
                       currentDesc.includes('如图摆放球型，完成') ||
                       currentDesc.length < 20;
    
    if (needsUpdate) {
      console.log(`提取 3-${i}...`);
      const extracted = await extractDescription(i);
      
      if (extracted && extracted.length > 8) {
        descriptions[key] = extracted;
        console.log(`3-${i}: ${extracted}`);
        updated++;
        
        // 每5题保存一次
        if (updated % 5 === 0) {
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    // 限制批次大小避免超时
    if (updated >= 20) {
      console.log('达到批次限制，保存进度...');
      break;
    }
  }
  
  // 最终保存
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  
  console.log(`Level 3 批次完成: ${updated} 题更新`);
  
  // 统计Level 3进度
  let authentic = 0;
  for (let i = 1; i <= 50; i++) {
    const desc = descriptions[`3-${i}`];
    if (desc && !desc.includes('如图示摆放球型，完成') && 
        !desc.includes('如图摆放球型，完成') && desc.length > 15) {
      authentic++;
    }
  }
  
  console.log(`Level 3: ${authentic}/50 真实描述 (${(authentic/50*100).toFixed(1)}%)`);
}

completeLevel3().catch(console.error);