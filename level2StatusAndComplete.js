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
          text: "提取题目说明文字，不要过关要求部分"
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
      // Thoroughly clean the content
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/连续完成.*$/gm, '');
      content = content.replace(/每边完成.*$/gm, '');
      content = content.replace(/[；。\n\r\t]+/g, '');
      content = content.trim();
      return content.length > 8 ? content : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// First clean up exercise 2-24 which has requirements mixed in
function cleanExistingDescriptions() {
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  // Clean exercise 2-24 
  if (descriptions['2-24'] && descriptions['2-24'].includes('连续完成10次不失误')) {
    descriptions['2-24'] = descriptions['2-24'].replace(/；.*连续完成10次不失误.*$/gm, '').trim();
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    console.log('Cleaned exercise 2-24 description');
  }
}

async function completeRemainingLevel2() {
  console.log('Starting Level 2 completion process...');
  
  // First clean existing descriptions
  cleanExistingDescriptions();
  
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  // Check current status
  let authenticCount = 0;
  let needsUpdate = [];
  
  for (let i = 1; i <= 40; i++) {
    const key = `2-${i}`;
    const desc = descriptions[key];
    
    if (desc && !desc.includes('如图摆放球型，白球任意位置') && desc.length > 20) {
      authenticCount++;
    } else {
      needsUpdate.push(i);
    }
  }
  
  console.log(`Current status: ${authenticCount}/40 exercises have authentic descriptions`);
  console.log(`Need to update: ${needsUpdate.length} exercises`);
  
  let updated = 0;
  
  // Process remaining exercises in smaller batches
  for (const exerciseNum of needsUpdate.slice(0, 8)) { // Process only 8 to avoid timeout
    const key = `2-${exerciseNum}`;
    
    console.log(`Processing ${key}...`);
    
    const extracted = await extractCleanDescription(exerciseNum);
    
    if (extracted && extracted.length > 10) {
      descriptions[key] = extracted;
      console.log(`  ✓ Updated: ${extracted}`);
      updated++;
      
      // Save immediately
      fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    } else {
      console.log(`  ✗ Extraction failed`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 600));
  }
  
  console.log(`\nBatch complete: ${updated} descriptions updated`);
  
  // Final status
  authenticCount = 0;
  for (let i = 1; i <= 40; i++) {
    const desc = descriptions[`2-${i}`];
    if (desc && !desc.includes('如图摆放球型，白球任意位置') && desc.length > 20) {
      authenticCount++;
    }
  }
  
  console.log(`Level 2 status: ${authenticCount}/40 exercises have authentic descriptions`);
  console.log(`Completion rate: ${(authenticCount/40*100).toFixed(1)}%`);
}

completeRemainingLevel2().catch(console.error);