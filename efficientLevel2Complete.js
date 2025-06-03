import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(exerciseNum) {
  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
  const imagePath = path.join(process.cwd(), 'assessments', '2、小有所成', `2、小有所成_${fileIndex}.jpg`);

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
          text: "精确提取'题目说明：'后的完整文字，只要说明部分"
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }]
      }],
      max_tokens: 80,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法')) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/[；。]+$/, '');
      return content.trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function processRemainingLevel2() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let updated = 0;
  
  // Process exercises that still have generic descriptions
  const exercisesToUpdate = [];
  for (let i = 1; i <= 40; i++) {
    const key = `2-${i}`;
    const current = descriptions[key];
    if (!current || current.includes('如图摆放球型，白球任意位置') || current.length < 20) {
      exercisesToUpdate.push(i);
    }
  }
  
  console.log(`需要更新 ${exercisesToUpdate.length} 个练习描述`);
  
  for (const exerciseNum of exercisesToUpdate.slice(0, 15)) { // Process first 15
    const key = `2-${exerciseNum}`;
    
    const extracted = await extractDescription(exerciseNum);
    
    if (extracted && extracted.length > 10) {
      descriptions[key] = extracted;
      console.log(`${key}: ${extracted}`);
      updated++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`\n更新了 ${updated} 个描述`);
}

processRemainingLevel2().catch(console.error);