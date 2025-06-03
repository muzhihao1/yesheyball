import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Complete systematic extraction of all exercise requirements
const ALL_LEVELS = [
  { level: 1, folder: "1、初窥门径", exercises: 35 },
  { level: 2, folder: "2、小有所成", exercises: 40 },
  { level: 3, folder: "3、渐入佳境", exercises: 50 }
];

async function extractFromImage(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Extract only the Chinese text that appears immediately after '过关要求:' in billiards exercise images. Return the exact requirement text without any additional formatting."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "提取过关要求的准确文字内容"
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 30,
      temperature: 0
    });

    return response.choices[0].message.content?.trim();
  } catch (error) {
    console.error(`Extraction failed: ${error.message}`);
    return null;
  }
}

async function processAllExercises() {
  console.log("Starting complete extraction of all exercise requirements...\n");
  
  const finalResults = {};
  let successCount = 0;
  let failCount = 0;

  for (const levelConfig of ALL_LEVELS) {
    console.log(`Processing Level ${levelConfig.level}: ${levelConfig.folder}`);
    
    for (let exercise = 1; exercise <= levelConfig.exercises; exercise++) {
      const fileNum = (exercise + 1).toString().padStart(2, '0');
      const imagePath = path.join(
        process.cwd(), 
        'assessments', 
        levelConfig.folder, 
        `${levelConfig.folder}_${fileNum}.jpg`
      );

      if (fs.existsSync(imagePath)) {
        process.stdout.write(`  Exercise ${exercise}... `);
        
        const requirement = await extractFromImage(imagePath);
        
        if (requirement && requirement.length > 2) {
          const cleanReq = requirement.replace(/^过关要求[:：]\s*/, '').replace(/[；;。，,\s]+$/, '');
          finalResults[`${levelConfig.level}-${exercise}`] = cleanReq;
          console.log(`✓ ${cleanReq}`);
          successCount++;
        } else {
          console.log(`✗ Failed`);
          failCount++;
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 800));
      } else {
        console.log(`  Exercise ${exercise}: Image not found`);
        failCount++;
      }
    }
    
    console.log(`Level ${levelConfig.level} completed\n`);
  }

  // Save complete results
  const outputPath = path.join(process.cwd(), 'client/src/data/exerciseRequirements.json');
  
  // Backup existing file
  if (fs.existsSync(outputPath)) {
    fs.copyFileSync(outputPath, outputPath.replace('.json', '_backup.json'));
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(finalResults, null, 2));
  
  console.log(`Extraction complete!`);
  console.log(`Success: ${successCount}, Failed: ${failCount}`);
  console.log(`Total exercises: ${Object.keys(finalResults).length}`);
  console.log(`Results saved to: exerciseRequirements.json`);
  
  return finalResults;
}

// Execute the complete extraction
if (process.argv.includes('--run')) {
  processAllExercises().catch(console.error);
}

export { processAllExercises };