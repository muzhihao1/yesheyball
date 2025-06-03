import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(exerciseNum) {
  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
  const imagePath = path.join(process.cwd(), 'assessments', '1、初窥门径', `1、初窥门径_${fileIndex}.jpg`);

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
      content = content.replace(/^题目说明[：:]\s*/g, '').replace(/过关要求.*$/gm, '').replace(/[；。\n]+$/, '').trim();
      return content.length > 8 ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function addMissingLevel1() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  const missing = [36, 37];
  let updated = 0;
  
  console.log(`添加Level 1缺失的${missing.length}题...`);
  
  for (const exerciseNum of missing) {
    const key = `1-${exerciseNum}`;
    
    const extracted = await extractDescription(exerciseNum);
    
    if (extracted) {
      descriptions[key] = extracted;
      console.log(`${key}: ${extracted}`);
      updated++;
    } else {
      descriptions[key] = "如图示摆放球型，完成基础台球训练";
      console.log(`${key}: [默认] 如图示摆放球型，完成基础台球训练`);
      updated++;
    }
    
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`Level 1补充完成: ${updated}题`);
  
  // 验证Level 1总数
  let count = 0;
  for (let i = 1; i <= 37; i++) {
    if (descriptions[`1-${i}`]) count++;
  }
  console.log(`Level 1现在有: ${count}/37题`);
}

addMissingLevel1().catch(console.error);