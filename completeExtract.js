import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Complete level configurations based on actual file structure
const LEVELS = [
  { level: 1, folder: "1、初窥门径", totalExercises: 35 },
  { level: 2, folder: "2、小有所成", totalExercises: 40 },
  { level: 3, folder: "3、渐入佳境", totalExercises: 50 }
];

async function extractRequirement(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Extract the exact Chinese text that appears after '过关要求:' in billiards exercise images. Return only the requirement text with no additional formatting or punctuation."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the pass requirement text from this image."
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 30,
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    return content ? content.replace(/[；;。，,\s]+$/, '').trim() : null;
  } catch (error) {
    console.error(`API error: ${error.message}`);
    return null;
  }
}

async function processAllLevels() {
  console.log("Starting comprehensive extraction of all exercise requirements...\n");
  
  const finalResults = {};
  let totalExtracted = 0;
  let totalFailed = 0;
  
  for (const levelConfig of LEVELS) {
    console.log(`Processing Level ${levelConfig.level}: ${levelConfig.folder}`);
    console.log("=".repeat(50));
    
    for (let exerciseNum = 1; exerciseNum <= levelConfig.totalExercises; exerciseNum++) {
      const fileIndex = (exerciseNum + 1).toString().padStart(2, '0'); // Skip 00, 01
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        levelConfig.folder, 
        `${levelConfig.folder}_${fileIndex}.jpg`
      );
      
      if (fs.existsSync(imagePath)) {
        console.log(`  Exercise ${exerciseNum} (${fileIndex}.jpg)...`);
        
        try {
          const requirement = await extractRequirement(imagePath);
          
          if (requirement && requirement.length > 0) {
            const key = `${levelConfig.level}-${exerciseNum}`;
            finalResults[key] = requirement;
            console.log(`    ✓ ${requirement}`);
            totalExtracted++;
          } else {
            console.log(`    ✗ No requirement extracted`);
            totalFailed++;
          }
          
          // Rate limiting to avoid API issues
          await new Promise(resolve => setTimeout(resolve, 800));
          
        } catch (error) {
          console.log(`    ✗ Error: ${error.message}`);
          totalFailed++;
        }
      } else {
        console.log(`  Exercise ${exerciseNum}: Image not found`);
        totalFailed++;
      }
    }
    
    console.log(`\nLevel ${levelConfig.level} completed\n`);
  }
  
  // Save complete results
  const outputPath = path.join(process.cwd(), 'client/src/data/exerciseRequirements.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalResults, null, 2), 'utf8');
  
  console.log("=".repeat(60));
  console.log("EXTRACTION COMPLETE");
  console.log("=".repeat(60));
  console.log(`✓ Successfully extracted: ${totalExtracted} exercises`);
  console.log(`✗ Failed extractions: ${totalFailed} exercises`);
  console.log(`📁 Results saved to: exerciseRequirements.json`);
  console.log(`🎯 Accuracy rate: ${((totalExtracted / (totalExtracted + totalFailed)) * 100).toFixed(1)}%`);
  
  return finalResults;
}

// Add progress tracking
let processedCount = 0;
const originalLog = console.log;
console.log = function(...args) {
  if (args[0] && args[0].includes('✓')) {
    processedCount++;
    if (processedCount % 5 === 0) {
      originalLog(`\n--- Progress: ${processedCount} exercises completed ---\n`);
    }
  }
  originalLog.apply(console, args);
};

processAllLevels().catch(console.error);