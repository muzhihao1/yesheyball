import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(exerciseNum) {
  const folderName = '4、炉火纯青';
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
          text: "提取题目说明，只要说明不要过关要求"
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
      content = content.replace(/次不失误.*$/gm, '');
      content = content.replace(/[；。\n\r\t]+$/, '');
      return content.trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function completeLevel4Systematic() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  console.log('系统性完成Level 4 (9-30题)...');
  
  let updated = 0;
  
  for (let i = 9; i <= 30; i++) {
    const key = `4-${i}`;
    const currentDesc = descriptions[key];
    
    if (!currentDesc || currentDesc.includes('如图示摆放球型，完成') || currentDesc.length < 20) {
      const extracted = await extractDescription(i);
      
      if (extracted && extracted.length > 8 && !extracted.includes('连续完成')) {
        descriptions[key] = extracted;
        console.log(`4-${i}: ${extracted}`);
        updated++;
        
        if (updated % 2 === 0) {
          fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 350));
    }
    
    if (updated >= 15) break;
  }
  
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`Level 4 批次: ${updated} 题更新`);
  
  let authentic = 0;
  for (let i = 1; i <= 60; i++) {
    const desc = descriptions[`4-${i}`];
    if (desc && !desc.includes('如图示摆放球型，完成') && desc.length > 15) {
      authentic++;
    }
  }
  console.log(`Level 4: ${authentic}/60 (${(authentic/60*100).toFixed(1)}%)`);
}

completeLevel4Systematic().catch(console.error);