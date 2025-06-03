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

async function extractLevel1Descriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let updated = 0;
  let needUpdate = [];
  
  // 识别需要更新的题目
  for (let i = 1; i <= 37; i++) {
    const key = `1-${i}`;
    const desc = descriptions[key];
    if (!desc || desc.includes('如图示摆放球型，完成基础台球训练') || desc.length < 20) {
      needUpdate.push(i);
    }
  }
  
  console.log(`Level 1需要提取描述的题目: ${needUpdate.length}题`);
  
  // 批量处理，限制数量避免超时
  for (const exerciseNum of needUpdate.slice(0, 10)) {
    const key = `1-${exerciseNum}`;
    
    const extracted = await extractDescription(exerciseNum);
    
    if (extracted && extracted.length > 8) {
      descriptions[key] = extracted;
      console.log(`${key}: ${extracted}`);
      updated++;
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    }
    
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  
  console.log(`Level 1批次完成: ${updated} 题更新`);
  
  // 统计真实描述数量
  let authentic = 0;
  for (let i = 1; i <= 37; i++) {
    const desc = descriptions[`1-${i}`];
    if (desc && !desc.includes('如图示摆放球型，完成基础台球训练') && desc.length > 15) {
      authentic++;
    }
  }
  
  console.log(`Level 1进度: ${authentic}/37 真实描述 (${(authentic/37*100).toFixed(1)}%)`);
}

extractLevel1Descriptions().catch(console.error);