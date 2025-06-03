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

async function finishLevel2() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let updated = 0;
  
  // Process exercises 16-30 (15 exercises)
  for (let i = 16; i <= 30; i++) {
    const key = `2-${i}`;
    
    if (descriptions[key] && !descriptions[key].includes('如图摆放球型，白球任意位置')) {
      continue;
    }
    
    const extracted = await extractDescription(i);
    
    if (extracted) {
      descriptions[key] = extracted;
      console.log(`${key}: ${extracted}`);
      updated++;
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`Exercises 16-30 complete: ${updated} updates`);
  
  // Count current authentic descriptions
  let authentic = 0;
  for (let i = 1; i <= 40; i++) {
    const desc = descriptions[`2-${i}`];
    if (desc && !desc.includes('如图摆放球型，白球任意位置') && desc.length > 20) {
      authentic++;
    }
  }
  console.log(`Level 2 progress: ${authentic}/40 authentic descriptions`);
}

finishLevel2().catch(console.error);