import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractDescription(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "从图片中提取'题目说明：'的完整文字，只要说明部分"
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 80,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法')) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/；$/, '');
      return content.trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function updateLevel2Remaining() {
  console.log("完成Level 2剩余练习描述更新...");
  
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let updated = 0;
  
  // 处理前20个练习
  for (let exercise = 1; exercise <= 20; exercise++) {
    const key = `2-${exercise}`;
    const current = descriptions[key];
    
    if (current && !current.includes('如图摆放球型，白球任意位置')) {
      continue;
    }
    
    const fileIndex = (exercise + 1).toString().padStart(2, '0');
    const imagePath = path.join(
      process.cwd(), 
      'assessments', 
      '2、小有所成', 
      `2、小有所成_${fileIndex}.jpg`
    );
    
    if (fs.existsSync(imagePath)) {
      process.stdout.write(`${key}... `);
      
      const extracted = await extractDescription(imagePath);
      
      if (extracted && extracted.length > 10) {
        descriptions[key] = extracted;
        console.log(`✓`);
        updated++;
      } else {
        console.log(`✗`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }
  
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`\n前20个练习完成，更新了 ${updated} 个描述`);
}

updateLevel2Remaining().catch(console.error);