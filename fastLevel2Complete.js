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
              text: "提取'题目说明：'文字"
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 60,
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

async function processSmallBatch() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let updated = 0;
  
  // 只处理前5个练习
  for (let exercise = 1; exercise <= 5; exercise++) {
    const key = `2-${exercise}`;
    
    if (descriptions[key] && !descriptions[key].includes('如图摆放球型，白球任意位置')) {
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
      const extracted = await extractDescription(imagePath);
      
      if (extracted && extracted.length > 8) {
        descriptions[key] = extracted;
        console.log(`${key}: ${extracted}`);
        updated++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }
  
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
  console.log(`更新了 ${updated} 个描述`);
}

processSmallBatch().catch(console.error);