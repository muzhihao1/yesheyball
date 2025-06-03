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
          text: "提取题目说明文字，不要过关要求"
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

async function completeFinalExercises() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let updated = 0;
  
  // Process final exercises 27-40
  for (let i = 27; i <= 40; i++) {
    const key = `2-${i}`;
    
    if (descriptions[key] && !descriptions[key].includes('如图摆放球型，白球任意位置')) {
      continue;
    }
    
    const extracted = await extractDescription(i);
    
    if (extracted && extracted.length > 10) {
      descriptions[key] = extracted;
      console.log(`${key}: ${extracted}`);
      updated++;
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`Final exercises complete: ${updated} updates`);
  
  // Count final authentic descriptions
  let authentic = 0;
  for (let i = 1; i <= 40; i++) {
    const desc = descriptions[`2-${i}`];
    if (desc && !desc.includes('如图摆放球型，白球任意位置') && desc.length > 20) {
      authentic++;
    }
  }
  
  console.log(`Level 2 completion: ${authentic}/40 authentic descriptions (${(authentic/40*100).toFixed(1)}%)`);
}

completeFinalExercises().catch(console.error);