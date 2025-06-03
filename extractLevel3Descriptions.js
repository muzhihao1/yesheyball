import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(exerciseNum) {
  const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
  const imagePath = path.join(process.cwd(), 'assessments', '3、渐入佳境', `3、渐入佳境_${fileIndex}.jpg`);

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

async function extractLevel3Descriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let updated = 0;
  
  console.log('开始提取Level 3描述 (批量1-15)...');
  
  // Process first batch (1-15)
  for (let i = 1; i <= 15; i++) {
    const key = `3-${i}`;
    const currentDesc = descriptions[key];
    
    if (!currentDesc || currentDesc.includes('如图摆放球型，完成中级台球技能训练') || currentDesc.length < 20) {
      const extracted = await extractDescription(i);
      
      if (extracted && extracted.length > 8) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
        fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
      }
      
      await new Promise(resolve => setTimeout(resolve, 400));
    }
  }
  
  console.log(`Level 3批次1完成: ${updated} 题更新`);
  
  // Count authentic descriptions
  let authentic = 0;
  for (let i = 1; i <= 50; i++) {
    const desc = descriptions[`3-${i}`];
    if (desc && !desc.includes('如图摆放球型，完成中级台球技能训练') && desc.length > 15) {
      authentic++;
    }
  }
  
  console.log(`Level 3进度: ${authentic}/50 真实描述 (${(authentic/50*100).toFixed(1)}%)`);
}

extractLevel3Descriptions().catch(console.error);