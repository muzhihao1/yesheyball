import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Efficient batch processing for exercise requirements
const LEVELS = [
  { level: 1, folder: "1、初窥门径", count: 20 }, // Process first 20 exercises
  { level: 2, folder: "2、小有所成", count: 20 },
  { level: 3, folder: "3、渐入佳境", count: 20 }
];

async function extractRequirement(imagePath) {
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
              text: "Extract the exact Chinese text after '过关要求:' from this billiards image."
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
      max_tokens: 20,
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    return content ? content.replace(/[；;。，,\s]+$/, '').trim() : null;
  } catch (error) {
    return null;
  }
}

async function processBatch() {
  console.log("Starting batch processing of exercise requirements...\n");
  
  const results = {};
  let processed = 0;

  for (const config of LEVELS) {
    console.log(`Processing Level ${config.level}...`);
    
    for (let i = 1; i <= config.count; i++) {
      const fileIndex = (i + 1).toString().padStart(2, '0');
      const imagePath = path.join(process.cwd(), 'assessments', config.folder, `${config.folder}_${fileIndex}.jpg`);
      
      if (fs.existsSync(imagePath)) {
        console.log(`  Exercise ${i}...`);
        
        const requirement = await extractRequirement(imagePath);
        if (requirement) {
          results[`${config.level}-${i}`] = requirement;
          console.log(`    ✓ ${requirement}`);
          processed++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }
  }

  // Save results
  const outputPath = 'client/src/data/exerciseRequirements.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\nCompleted! Processed ${processed} exercises.`);
  console.log(`Results saved to ${outputPath}`);
}

processBatch().catch(console.error);