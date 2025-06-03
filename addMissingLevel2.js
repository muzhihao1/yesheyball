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

async function addMissingLevel2() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  const missing = [41, 42];
  let updated = 0;
  
  console.log(`添加Level 2缺失的${missing.length}题...`);
  
  for (const exerciseNum of missing) {
    const key = `2-${exerciseNum}`;
    
    const extracted = await extractDescription(exerciseNum);
    
    if (extracted) {
      descriptions[key] = extracted;
      console.log(`${key}: ${extracted}`);
      updated++;
    } else {
      descriptions[key] = "如图摆放球型，完成台球技能练习";
      console.log(`${key}: [默认] 如图摆放球型，完成台球技能练习`);
      updated++;
    }
    
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`Level 2补充完成: ${updated}题`);
  
  // 验证Level 2总数
  let count = 0;
  for (let i = 1; i <= 42; i++) {
    if (descriptions[`2-${i}`]) count++;
  }
  console.log(`Level 2现在有: ${count}/42题`);
}

addMissingLevel2().catch(console.error);