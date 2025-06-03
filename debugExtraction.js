import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function debugSpecificExercise(level, exerciseNum) {
  try {
    const folderNames = {
      3: '3、渐入佳境', 4: '4、炉火纯青', 5: '5、登堂入室',
      6: '6、超群绝伦', 7: '7、登峰造极', 8: '8、出神入化'
    };
    
    const fileIndex = (exerciseNum + 1).toString().padStart(2, '0');
    const folderName = folderNames[level];
    const imagePath = path.join(process.cwd(), 'assessments', folderName, `${folderName}_${fileIndex}.jpg`);
    
    console.log(`Testing ${level}-${exerciseNum}:`);
    console.log(`File path: ${imagePath}`);
    console.log(`File exists: ${fs.existsSync(imagePath)}`);
    
    if (!fs.existsSync(imagePath)) {
      console.log('File not found, skipping\n');
      return null;
    }
    
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');
    console.log(`Image size: ${imageData.length} bytes`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: "提取题目说明"
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }]
      }],
      max_tokens: 50,
      temperature: 0
    });

    const rawContent = response.choices[0].message.content;
    console.log(`Raw response: "${rawContent}"`);
    
    if (rawContent && !rawContent.includes('无法') && !rawContent.includes("I'm sorry") && !rawContent.includes("I can't")) {
      let processedContent = rawContent.replace(/^题目说明[：:]\s*/g, '')
                                      .replace(/过关要求.*$/gm, '')
                                      .replace(/连续完成.*$/gm, '')
                                      .replace(/不超过.*$/gm, '')
                                      .replace(/[；。\n]+$/, '')
                                      .trim();
      console.log(`Processed: "${processedContent}"`);
      console.log(`Length: ${processedContent.length}`);
      console.log(`Would accept: ${processedContent.length > 8}`);
      
      if (processedContent.length > 8) {
        return processedContent;
      }
    } else {
      console.log('Content rejected due to filter words');
    }
    
    console.log('');
    return null;
  } catch (error) {
    console.log(`Error: ${error.message}\n`);
    return null;
  }
}

async function debugMissingExercises() {
  console.log('Debugging missing exercises...\n');
  
  // Test a few missing exercises from each level
  const testCases = [
    {level: 3, exercise: 6},
    {level: 3, exercise: 7},
    {level: 4, exercise: 31},
    {level: 5, exercise: 33},
    {level: 7, exercise: 1},
    {level: 8, exercise: 15}
  ];
  
  let successCount = 0;
  
  for (const {level, exercise} of testCases) {
    const result = await debugSpecificExercise(level, exercise);
    if (result) {
      successCount++;
      console.log(`SUCCESS: Would extract "${result}"\n`);
    } else {
      console.log(`FAILED: No valid extraction\n`);
    }
  }
  
  console.log(`Overall success rate: ${successCount}/${testCases.length}`);
  
  if (successCount > 0) {
    console.log('Extraction is working, likely a processing loop issue');
  } else {
    console.log('Extraction is failing, need to investigate API or image issues');
  }
}

debugMissingExercises().catch(console.error);