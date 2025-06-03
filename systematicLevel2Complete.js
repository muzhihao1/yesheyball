import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function extractExerciseDescription(exerciseNum) {
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
          text: "精确提取图片右侧蓝色区域'题目说明：'后的完整文字，只要说明部分，不要过关要求"
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }]
      }],
      max_tokens: 100,
      temperature: 0
    });

    let content = response.choices[0].message.content;
    if (content && !content.includes('无法') && !content.includes('抱歉')) {
      content = content.replace(/^题目说明[：:]\s*/g, '');
      content = content.replace(/过关要求.*$/gm, '');
      content = content.replace(/[；。]+$/, '');
      return content.trim();
    }
    return null;
  } catch (error) {
    console.error(`Exercise ${exerciseNum} extraction failed: ${error.message}`);
    return null;
  }
}

async function processLevel2Batch(startEx, endEx) {
  console.log(`Processing Level 2 exercises ${startEx}-${endEx}...`);
  
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  let descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let updated = 0;
  
  for (let exercise = startEx; exercise <= endEx; exercise++) {
    const key = `2-${exercise}`;
    const current = descriptions[key];
    
    // Update if generic description or needs fixing
    const needsUpdate = !current || 
      current.includes('如图摆放球型，白球任意位置') ||
      current.length < 20;
    
    if (!needsUpdate) {
      console.log(`  ${key}: Already has specific description, skipping`);
      continue;
    }
    
    console.log(`  Processing ${key}...`);
    
    const extracted = await extractExerciseDescription(exercise);
    
    if (extracted && extracted.length > 10) {
      descriptions[key] = extracted;
      console.log(`    ✓ Updated: "${extracted}"`);
      updated++;
    } else {
      console.log(`    ✗ Extraction failed`);
    }
    
    // Save after each update
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2), 'utf8');
    
    // Avoid API rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`Batch ${startEx}-${endEx} completed: ${updated} descriptions updated\n`);
  return updated;
}

async function completeAllLevel2() {
  console.log("Starting systematic Level 2 description extraction...\n");
  
  let totalUpdated = 0;
  
  // Process in batches of 5 to avoid timeouts
  const batches = [
    [6, 10],   // Fix exercise 6 and continue
    [11, 15],
    [16, 20],
    [21, 25],
    [26, 30],
    [31, 35],
    [36, 40]
  ];
  
  for (const [start, end] of batches) {
    try {
      const updated = await processLevel2Batch(start, end);
      totalUpdated += updated;
      
      // Rest between batches
      console.log("Resting between batches...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Error processing batch ${start}-${end}:`, error);
      continue;
    }
  }
  
  console.log(`=== Level 2 Completion Summary ===`);
  console.log(`Total descriptions updated: ${totalUpdated}`);
  
  // Final status check
  const descriptionsPath = 'client/src/data/exerciseDescriptions.json';
  const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  
  let authenticCount = 0;
  let genericCount = 0;
  
  console.log(`\nLevel 2 Final Status:`);
  for (let i = 1; i <= 40; i++) {
    const key = `2-${i}`;
    const desc = descriptions[key] || 'Missing';
    
    if (desc.includes('如图摆放球型，白球任意位置') || desc === 'Missing' || desc.length < 20) {
      genericCount++;
      console.log(`${key}: [Generic] ${desc.substring(0, 50)}...`);
    } else {
      authenticCount++;
      console.log(`${key}: [Authentic] ${desc.substring(0, 50)}...`);
    }
  }
  
  console.log(`\nCompletion Rate: ${authenticCount}/40 (${(authenticCount/40*100).toFixed(1)}%)`);
  console.log(`Authentic descriptions: ${authenticCount}`);
  console.log(`Generic descriptions: ${genericCount}`);
}

completeAllLevel2().catch(console.error);