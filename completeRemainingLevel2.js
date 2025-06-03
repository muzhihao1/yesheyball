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
          text: "提取'题目说明：'文字"
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }]
      }],
      max_tokens: 60,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    content = content.replace(/^题目说明[：:]\s*/g, '').replace(/[；。]+$/, '').trim();
    return content.length > 8 ? content : null;
  } catch (error) {
    return null;
  }
}

async function completeLevel2Remaining() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  // Process exercises 5-12 (8 exercises only to avoid timeout)
  for (let i = 5; i <= 12; i++) {
    const key = `2-${i}`;
    const current = descriptions[key];
    
    if (current && !current.includes('如图摆放球型，白球任意位置')) {
      continue;
    }
    
    const extracted = await extractDescription(i);
    
    if (extracted) {
      descriptions[key] = extracted;
      console.log(`${key}: ${extracted}`);
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    }
    
    await new Promise(resolve => setTimeout(resolve, 600));
  }
  
  console.log('Level 2 exercises 5-12 completed');
}

completeLevel2Remaining().catch(console.error);