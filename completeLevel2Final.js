import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractCleanDescription(exerciseNum) {
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
          text: "提取蓝色区域'题目说明：'后的文字，只要说明部分，不要过关要求"
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }]
      }],
      max_tokens: 80,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      // Clean the extracted content thoroughly
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/\n.*过关要求.*/gm, '');
      content = content.replace(/[；。\n]+$/, '');
      content = content.replace(/\n+/g, '');
      content = content.trim();
      
      return content.length > 8 ? content : null;
    }
    return null;
  } catch (error) {
    console.error(`Exercise ${exerciseNum} failed: ${error.message}`);
    return null;
  }
}

async function completeRemainingLevel2() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let updated = 0;
  
  // Process remaining exercises 20-40
  for (let i = 20; i <= 40; i++) {
    const key = `2-${i}`;
    const current = descriptions[key];
    
    // Skip if already has authentic description
    if (current && !current.includes('如图摆放球型，白球任意位置') && current.length > 20) {
      console.log(`${key}: Skip (has authentic description)`);
      continue;
    }
    
    console.log(`Processing ${key}...`);
    
    const extracted = await extractCleanDescription(i);
    
    if (extracted && extracted.length > 10) {
      descriptions[key] = extracted;
      console.log(`  ✓ Updated: ${extracted}`);
      updated++;
      
      // Save immediately after each update
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    } else {
      console.log(`  ✗ Extraction failed`);
    }
    
    // Shorter delay to process more exercises
    await new Promise(resolve => setTimeout(resolve, 600));
  }
  
  console.log(`\nRemaining Level 2 processing complete: ${updated} descriptions updated`);
  
  // Final count of authentic descriptions
  let authenticCount = 0;
  for (let i = 1; i <= 40; i++) {
    const desc = descriptions[`2-${i}`];
    if (desc && !desc.includes('如图摆放球型，白球任意位置') && desc.length > 20) {
      authenticCount++;
    }
  }
  
  console.log(`Level 2 final status: ${authenticCount}/40 exercises have authentic descriptions`);
  console.log(`Completion rate: ${(authenticCount/40*100).toFixed(1)}%`);
}

completeRemainingLevel2().catch(console.error);