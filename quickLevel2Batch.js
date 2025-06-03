import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extract(exerciseNum) {
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
          text: "提取题目说明文字"
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
      content = content.replace(/^题目说明[：:]\s*/g, '').replace(/[；。]+$/, '').trim();
      return content.length > 8 ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function processBatch() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let updated = 0;
  
  // Process exercises 13-20 (8 exercises to avoid timeout)
  for (let i = 13; i <= 20; i++) {
    const key = `2-${i}`;
    
    if (descriptions[key] && !descriptions[key].includes('如图摆放球型，白球任意位置') && descriptions[key].length > 20) {
      continue;
    }
    
    const extracted = await extract(i);
    
    if (extracted) {
      descriptions[key] = extracted;
      console.log(`${key}: ${extracted}`);
      updated++;
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    }
    
    await new Promise(resolve => setTimeout(resolve, 600));
  }
  
  console.log(`Batch complete: ${updated} updates`);
}

processBatch().catch(console.error);